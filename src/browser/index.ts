/**
 * Fluxez SDK - Browser Entry Point
 *
 * This file exports browser-compatible features:
 * - Chatbot widget
 * - Analytics tracking (lightweight, privacy-first)
 *
 * All other SDK features (database, realtime, AI, etc.) are Node.js only
 * for security and architectural reasons.
 */

// Base URL - will be replaced during build or can be overridden
const FLUXEZ_BASE_URL = 'https://api-dev.fluxez.com/api/v1';

// Check if we're in a browser environment
if (typeof window === 'undefined') {
  throw new Error('This module can only be imported in browser environments. For Node.js, use the main @fluxez/node-sdk import.');
}

export interface ChatbotOptions {
  position?: 'bottom-right' | 'bottom-left';
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  startOpen?: boolean;
  zIndex?: number;
  organizationId?: string;
  projectId?: string;
  appId?: string;
}

export interface ChatbotWidget {
  show(): void;
  hide(): void;
  toggle(): void;
  destroy(): void;
  isOpen(): boolean;
}

/**
 * Load Fluxez Chatbot Widget
 * This is the ONLY function available in browser environments
 *
 * @param apiKey - Your Fluxez API key (service_ or anon_ prefixed)
 * @param options - Optional configuration
 * @returns ChatbotWidget control interface
 */
export function loadChatbot(apiKey: string, options: ChatbotOptions = {}): ChatbotWidget {
  // Validate API key format (service_ or anon_ prefix, not JWT)
  if (!apiKey.startsWith('service_') && !apiKey.startsWith('anon_')) {
    throw new Error('Invalid API key format. Expected "service_" or "anon_" prefix.');
  }

  // Configuration
  const config = {
    position: options.position || 'bottom-right',
    theme: {
      primaryColor: options.theme?.primaryColor || '#0891b2',
      secondaryColor: options.theme?.secondaryColor || '#06b6d4',
    },
    zIndex: options.zIndex || 999999,
  };

  // Create container
  const container = document.createElement('div');
  container.id = 'fluxez-chatbot-container';
  container.style.cssText = `
    position: fixed;
    ${config.position === 'bottom-left' ? 'left: 20px' : 'right: 20px'};
    bottom: 20px;
    z-index: ${config.zIndex};
  `;
  document.body.appendChild(container);

  // State
  let isOpen = options.startOpen || false;
  let chatWindow: HTMLDivElement | null = null;
  let button: HTMLButtonElement | null = null;
  const sessionId = generateSessionId();
  const messages: Array<{ role: string; content: string; timestamp: string }> = [];

  // Create toggle button
  button = document.createElement('button');
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L1 23l6.71-1.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
    </svg>
  `;
  button.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 30px;
    background: linear-gradient(135deg, ${config.theme.primaryColor}, ${config.theme.secondaryColor});
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: ${isOpen ? 'none' : 'flex'};
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  `;

  button.onmouseover = () => {
    button!.style.transform = 'scale(1.1)';
    button!.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
  };

  button.onmouseout = () => {
    button!.style.transform = 'scale(1)';
    button!.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  };

  // Create chat window (lazy loaded)
  const createChatWindow = () => {
    if (chatWindow) return;

    chatWindow = document.createElement('div');
    chatWindow.style.cssText = `
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 40px);
      border: none;
      border-radius: 16px;
      box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
      background: white;
      display: ${isOpen ? 'flex' : 'none'};
      flex-direction: column;
      transform-origin: ${config.position === 'bottom-left' ? 'bottom left' : 'bottom right'};
      transition: all 0.3s ease;
      overflow: hidden;
    `;

    // Mobile responsiveness
    if (window.innerWidth <= 768) {
      chatWindow.style.width = 'calc(100vw - 40px)';
      chatWindow.style.maxWidth = '380px';
    }

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 16px;
      background: linear-gradient(135deg, ${config.theme.primaryColor}, ${config.theme.secondaryColor});
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Chat Support</h3>
      <button id="chatbot-close" style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
        </svg>
      </button>
    `;

    // Messages area
    const messagesArea = document.createElement('div');
    messagesArea.id = 'chatbot-messages';
    messagesArea.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f9fafb;
    `;

    // Input area
    const inputArea = document.createElement('div');
    inputArea.style.cssText = `
      padding: 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    `;
    inputArea.innerHTML = `
      <input
        id="chatbot-input"
        type="text"
        placeholder="Type your message..."
        style="flex: 1; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
      />
      <button
        id="chatbot-send"
        style="padding: 10px 16px; background: ${config.theme.primaryColor}; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;"
      >
        Send
      </button>
    `;

    chatWindow.appendChild(header);
    chatWindow.appendChild(messagesArea);
    chatWindow.appendChild(inputArea);
    container.appendChild(chatWindow);

    // Event listeners
    const closeButton = chatWindow.querySelector('#chatbot-close') as HTMLButtonElement;
    const input = chatWindow.querySelector('#chatbot-input') as HTMLInputElement;
    const sendButton = chatWindow.querySelector('#chatbot-send') as HTMLButtonElement;

    closeButton.onclick = hide;

    const sendMessage = async () => {
      const message = input.value.trim();
      if (!message) return;

      // Add user message to UI
      addMessage('user', message);
      input.value = '';

      // Show typing indicator
      const typingId = showTyping();

      try {
        // Build headers with context
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        };

        // Add context headers if provided
        if (options.organizationId) {
          headers['x-organization-id'] = options.organizationId;
        }
        if (options.projectId) {
          headers['x-project-id'] = options.projectId;
        }
        if (options.appId) {
          headers['x-app-id'] = options.appId;
        }

        // Send message to API
        const response = await fetch(`${FLUXEZ_BASE_URL}/chatbot/send`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message,
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();
        removeTyping(typingId);

        // Handle response - could be direct data or wrapped in ApiResponse
        const messageContent = data.data?.message?.content || data.message?.content || data.answer || 'Sorry, I encountered an error.';
        addMessage('assistant', messageContent);
      } catch (error) {
        console.error('Chatbot error:', error);
        removeTyping(typingId);
        addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      }
    };

    sendButton.onclick = sendMessage;
    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    };

    // Focus input on open
    input.focus();

    // Input focus styling
    input.onfocus = () => {
      input.style.borderColor = config.theme.primaryColor;
    };
    input.onblur = () => {
      input.style.borderColor = '#e5e7eb';
    };

    // Send button hover
    sendButton.onmouseover = () => {
      sendButton.style.background = config.theme.secondaryColor;
    };
    sendButton.onmouseout = () => {
      sendButton.style.background = config.theme.primaryColor;
    };
  };

  const addMessage = (role: string, content: string) => {
    const messagesArea = chatWindow?.querySelector('#chatbot-messages');
    if (!messagesArea) return;

    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      ${role === 'user' ? 'justify-content: flex-end' : 'justify-content: flex-start'}
    `;

    const bubble = document.createElement('div');
    bubble.style.cssText = `
      max-width: 70%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      ${role === 'user'
        ? `background: ${config.theme.primaryColor}; color: white; border-bottom-right-radius: 4px;`
        : 'background: white; color: #374151; border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);'}
    `;
    bubble.textContent = content;

    messageDiv.appendChild(bubble);
    messagesArea.appendChild(messageDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    messages.push({ role, content, timestamp: new Date().toISOString() });
  };

  const showTyping = () => {
    const messagesArea = chatWindow?.querySelector('#chatbot-messages');
    if (!messagesArea) return '';

    const typingId = `typing-${Date.now()}`;
    const typingDiv = document.createElement('div');
    typingDiv.id = typingId;
    typingDiv.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-start;
    `;

    const bubble = document.createElement('div');
    bubble.style.cssText = `
      padding: 10px 14px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      border-bottom-left-radius: 4px;
    `;
    bubble.innerHTML = `
      <div style="display: flex; gap: 4px;">
        <span style="width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: typing 1.4s infinite;"></span>
        <span style="width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: typing 1.4s infinite 0.2s;"></span>
        <span style="width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: typing 1.4s infinite 0.4s;"></span>
      </div>
    `;

    // Add typing animation
    if (!document.getElementById('fluxez-chatbot-typing-animation')) {
      const style = document.createElement('style');
      style.id = 'fluxez-chatbot-typing-animation';
      style.textContent = `
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
      `;
      document.head.appendChild(style);
    }

    typingDiv.appendChild(bubble);
    messagesArea.appendChild(typingDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    return typingId;
  };

  const removeTyping = (typingId: string) => {
    const typingDiv = document.getElementById(typingId);
    typingDiv?.remove();
  };

  // Toggle functions
  const show = () => {
    createChatWindow();
    isOpen = true;
    if (button) button.style.display = 'none';
    if (chatWindow) {
      chatWindow.style.display = 'flex';
      // Animate in
      chatWindow.style.transform = 'scale(0.9)';
      chatWindow.style.opacity = '0';
      setTimeout(() => {
        if (chatWindow) {
          chatWindow.style.transform = 'scale(1)';
          chatWindow.style.opacity = '1';
        }
      }, 50);

      // Welcome message if first time
      if (messages.length === 0) {
        setTimeout(() => {
          addMessage('assistant', 'Hello! How can I help you today?');
        }, 300);
      }

      // Focus input
      const input = chatWindow.querySelector('#chatbot-input') as HTMLInputElement;
      setTimeout(() => input?.focus(), 100);
    }
  };

  const hide = () => {
    isOpen = false;
    if (button) button.style.display = 'flex';
    if (chatWindow) {
      // Animate out
      chatWindow.style.transform = 'scale(0.9)';
      chatWindow.style.opacity = '0';
      setTimeout(() => {
        if (chatWindow) chatWindow.style.display = 'none';
      }, 300);
    }
  };

  const toggle = () => {
    if (isOpen) {
      hide();
    } else {
      show();
    }
  };

  // Button click handler
  button.onclick = toggle;

  // Add to container
  container.appendChild(button);

  // Show if startOpen is true
  if (isOpen) {
    show();
  }

  // Return widget interface
  return {
    show,
    hide,
    toggle,
    destroy: () => {
      container.remove();
      chatWindow = null;
      button = null;
    },
    isOpen: () => isOpen,
  };
}

/**
 * Generate a unique session ID
 * @private
 */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== ANALYTICS ====================

export interface AnalyticsOptions {
  /** Auto-track page views on route changes */
  autoTrack?: boolean;
  /** Auto-track page views (SPA-friendly) */
  trackPageViews?: boolean;
  /** Track outbound link clicks */
  trackOutboundLinks?: boolean;
  /** Track file downloads */
  trackDownloads?: boolean;
  /** Respect Do Not Track header */
  respectDNT?: boolean;
  /** Custom API endpoint (defaults to Fluxez API) */
  apiUrl?: string;
  /** Batch events before sending */
  batchSize?: number;
  /** Flush interval in ms */
  flushInterval?: number;
  /** Organization ID */
  organizationId?: string;
  /** Project ID */
  projectId?: string;
  /** App ID */
  appId?: string;
  /** Debug mode */
  debug?: boolean;
}

export interface TrackEventOptions {
  /** Custom properties */
  properties?: Record<string, any>;
  /** Numeric value (for revenue tracking) */
  value?: number;
  /** User ID (if logged in) */
  userId?: string;
}

export interface AnalyticsInstance {
  /** Track a custom event */
  track(eventName: string, options?: TrackEventOptions): void;
  /** Track a page view */
  trackPageView(pathname?: string, referrer?: string): void;
  /** Identify a user */
  identify(userId: string, properties?: Record<string, any>): void;
  /** Flush pending events */
  flush(): Promise<void>;
  /** Destroy and cleanup */
  destroy(): void;
  /** Enable tracking */
  enable(): void;
  /** Disable tracking */
  disable(): void;
  /** Check if tracking is enabled */
  isEnabled(): boolean;
}

/**
 * Load Fluxez Analytics - Lightweight, Privacy-First Analytics
 *
 * Similar to Plausible/Umami - cookieless, GDPR-friendly
 *
 * @param apiKey - Your Fluxez API key (service_ or anon_ prefixed)
 * @param options - Optional configuration
 * @returns AnalyticsInstance control interface
 *
 * @example
 * ```typescript
 * const analytics = loadAnalytics('anon_xxx', {
 *   autoTrack: true,
 *   trackPageViews: true,
 *   trackOutboundLinks: true,
 * });
 *
 * // Track custom events
 * analytics.track('button_click', { properties: { buttonId: 'signup' } });
 *
 * // Identify logged-in users
 * analytics.identify('user_123', { email: 'user@example.com' });
 * ```
 */
export function loadAnalytics(apiKey: string, options: AnalyticsOptions = {}): AnalyticsInstance {
  // Validate API key format
  if (!apiKey.startsWith('service_') && !apiKey.startsWith('anon_')) {
    throw new Error('Invalid API key format. Expected "service_" or "anon_" prefix.');
  }

  // Respect Do Not Track if configured
  if (options.respectDNT && navigator.doNotTrack === '1') {
    console.log('[Fluxez Analytics] Do Not Track enabled - tracking disabled');
    return createDisabledInstance();
  }

  // Configuration
  const config = {
    apiUrl: options.apiUrl || FLUXEZ_BASE_URL,
    autoTrack: options.autoTrack ?? true,
    trackPageViews: options.trackPageViews ?? true,
    trackOutboundLinks: options.trackOutboundLinks ?? false,
    trackDownloads: options.trackDownloads ?? false,
    batchSize: options.batchSize ?? 10,
    flushInterval: options.flushInterval ?? 5000,
    debug: options.debug ?? false,
  };

  // State
  let enabled = true;
  let visitorId = getOrCreateVisitorId();
  let sessionId = generateAnalyticsSessionId();
  let userId: string | undefined;
  let eventQueue: any[] = [];
  let flushTimer: ReturnType<typeof setInterval> | null = null;
  let lastPathname = '';

  // Build headers
  const buildHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    };
    if (options.organizationId) headers['x-organization-id'] = options.organizationId;
    if (options.projectId) headers['x-project-id'] = options.projectId;
    if (options.appId) headers['x-app-id'] = options.appId;
    return headers;
  };

  // Get browser info
  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let browserVersion = '';
    let os = 'Unknown';
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';

    // Browser detection
    if (ua.includes('Firefox/')) {
      browser = 'Firefox';
      browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || '';
    } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
      browser = 'Chrome';
      browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || '';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
      browser = 'Safari';
      browserVersion = ua.match(/Version\/(\d+)/)?.[1] || '';
    } else if (ua.includes('Edg/')) {
      browser = 'Edge';
      browserVersion = ua.match(/Edg\/(\d+)/)?.[1] || '';
    }

    // OS detection
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    // Device detection
    if (/Mobi|Android/i.test(ua)) deviceType = 'mobile';
    else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';

    return { browser, browserVersion, os, deviceType };
  };

  // Extract UTM params from URL
  const getUtmParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source') || '',
      utmMedium: params.get('utm_medium') || '',
      utmCampaign: params.get('utm_campaign') || '',
      utmTerm: params.get('utm_term') || '',
      utmContent: params.get('utm_content') || '',
    };
  };

  // Queue an event
  const queueEvent = (event: any) => {
    if (!enabled) return;

    const { browser, browserVersion, os, deviceType } = getBrowserInfo();
    const utm = getUtmParams();

    const fullEvent = {
      ...event,
      visitorId,
      sessionId,
      userId,
      hostname: window.location.hostname,
      referrer: document.referrer,
      ...utm,
      browser,
      browserVersion,
      os,
      deviceType,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timestamp: new Date().toISOString(),
    };

    eventQueue.push(fullEvent);

    if (config.debug) {
      console.log('[Fluxez Analytics] Event queued:', fullEvent);
    }

    // Flush if batch size reached
    if (eventQueue.length >= config.batchSize) {
      flush();
    }
  };

  // Flush events to server
  const flush = async (): Promise<void> => {
    if (eventQueue.length === 0) return;

    const events = [...eventQueue];
    eventQueue = [];

    try {
      const response = await fetch(`${config.apiUrl}/analytics/track/batch`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ events }),
        keepalive: true, // Ensure events are sent even on page unload
      });

      if (!response.ok) {
        // Re-queue events on failure
        eventQueue = events.concat(eventQueue);
        if (config.debug) {
          console.error('[Fluxez Analytics] Failed to send events:', response.status);
        }
      } else if (config.debug) {
        console.log('[Fluxez Analytics] Flushed', events.length, 'events');
      }
    } catch (error) {
      // Re-queue events on error
      eventQueue = events.concat(eventQueue);
      if (config.debug) {
        console.error('[Fluxez Analytics] Error sending events:', error);
      }
    }
  };

  // Track page view
  const trackPageView = (pathname?: string, referrer?: string) => {
    const path = pathname || window.location.pathname;
    queueEvent({
      name: 'pageview',
      type: 'pageview',
      pathname: path,
      referrer: referrer || document.referrer,
    });
  };

  // Track custom event
  const track = (eventName: string, options: TrackEventOptions = {}) => {
    queueEvent({
      name: eventName,
      type: 'event',
      pathname: window.location.pathname,
      properties: options.properties,
      value: options.value,
      ...(options.userId && { userId: options.userId }),
    });
  };

  // Identify user
  const identify = (newUserId: string, properties?: Record<string, any>) => {
    userId = newUserId;
    queueEvent({
      name: '$identify',
      type: 'identify',
      userId: newUserId,
      properties,
    });
  };

  // Setup auto-tracking
  const setupAutoTracking = () => {
    // Track initial page view
    if (config.trackPageViews) {
      trackPageView();
      lastPathname = window.location.pathname;
    }

    // Track SPA route changes via History API
    if (config.autoTrack && config.trackPageViews) {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function (...args) {
        originalPushState.apply(this, args);
        const newPath = window.location.pathname;
        if (newPath !== lastPathname) {
          trackPageView(newPath);
          lastPathname = newPath;
        }
      };

      history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        const newPath = window.location.pathname;
        if (newPath !== lastPathname) {
          trackPageView(newPath);
          lastPathname = newPath;
        }
      };

      // Handle popstate (back/forward buttons)
      window.addEventListener('popstate', () => {
        const newPath = window.location.pathname;
        if (newPath !== lastPathname) {
          trackPageView(newPath);
          lastPathname = newPath;
        }
      });
    }

    // Track outbound links
    if (config.trackOutboundLinks) {
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (link && link.href) {
          try {
            const url = new URL(link.href);
            if (url.hostname !== window.location.hostname) {
              track('outbound_click', {
                properties: {
                  url: link.href,
                  text: link.textContent?.trim().slice(0, 100),
                },
              });
            }
          } catch {}
        }
      });
    }

    // Track file downloads
    if (config.trackDownloads) {
      const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar', '.exe', '.dmg'];
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (link && link.href) {
          const isDownload = downloadExtensions.some(ext => link.href.toLowerCase().includes(ext));
          if (isDownload) {
            track('file_download', {
              properties: {
                url: link.href,
                filename: link.href.split('/').pop(),
              },
            });
          }
        }
      });
    }
  };

  // Flush on page unload
  const setupUnloadHandler = () => {
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flush();
      }
    });

    window.addEventListener('pagehide', () => {
      flush();
    });
  };

  // Start periodic flush
  const startFlushTimer = () => {
    if (flushTimer) clearInterval(flushTimer);
    flushTimer = setInterval(flush, config.flushInterval);
  };

  // Initialize
  setupAutoTracking();
  setupUnloadHandler();
  startFlushTimer();

  if (config.debug) {
    console.log('[Fluxez Analytics] Initialized', {
      visitorId,
      sessionId,
      config,
    });
  }

  // Return public interface
  return {
    track,
    trackPageView,
    identify,
    flush,
    destroy: () => {
      if (flushTimer) clearInterval(flushTimer);
      flush();
    },
    enable: () => { enabled = true; },
    disable: () => { enabled = false; },
    isEnabled: () => enabled,
  };
}

/**
 * Create a disabled analytics instance (for DNT or opt-out)
 */
function createDisabledInstance(): AnalyticsInstance {
  return {
    track: () => {},
    trackPageView: () => {},
    identify: () => {},
    flush: async () => {},
    destroy: () => {},
    enable: () => {},
    disable: () => {},
    isEnabled: () => false,
  };
}

/**
 * Get or create a visitor ID (stored in localStorage)
 * Privacy-friendly: uses a random ID, not fingerprinting
 */
function getOrCreateVisitorId(): string {
  const key = '_fx_vid';
  try {
    let visitorId = localStorage.getItem(key);
    if (!visitorId) {
      visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
      localStorage.setItem(key, visitorId);
    }
    return visitorId;
  } catch {
    // localStorage not available, use session-only ID
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }
}

/**
 * Generate a session ID (new per browser session)
 */
function generateAnalyticsSessionId(): string {
  const key = '_fx_sid';
  try {
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
      sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(key, sessionId);
    }
    return sessionId;
  } catch {
    return `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Default export
export default { loadChatbot, loadAnalytics };
