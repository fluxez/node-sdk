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
export declare function loadChatbot(apiKey: string, options?: ChatbotOptions): ChatbotWidget;
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
export declare function loadAnalytics(apiKey: string, options?: AnalyticsOptions): AnalyticsInstance;
declare const _default: {
    loadChatbot: typeof loadChatbot;
    loadAnalytics: typeof loadAnalytics;
};
export default _default;
//# sourceMappingURL=index.d.ts.map