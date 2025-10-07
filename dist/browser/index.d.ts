/**
 * Fluxez SDK - Browser Entry Point
 *
 * This file exports ONLY browser-compatible features.
 * Currently, that's just the chatbot widget.
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
export default loadChatbot;
//# sourceMappingURL=index.d.ts.map