import { HttpClient } from '../core/http-client';
export interface RealtimeOptions {
    autoReconnect?: boolean;
    maxReconnectAttempts?: number;
    reconnectDelay?: number;
    timeout?: number;
    debug?: boolean;
}
export interface DatabaseSubscriptionOptions {
    events?: Array<'INSERT' | 'UPDATE' | 'DELETE'>;
    filter?: Record<string, any>;
    realtime?: boolean;
}
export interface PresenceUser {
    id: string;
    name?: string;
    avatar?: string;
    metadata?: Record<string, any>;
    joined_at?: string;
    last_seen?: string;
}
export interface PresenceUpdate {
    joined: PresenceUser[];
    left: Array<{
        id: string;
        left_at: string;
    }>;
    updated: PresenceUser[];
}
export declare class RealtimeModule {
    private httpClient;
    private apiKey;
    private socket;
    private subscriptions;
    private channels;
    private presenceChannels;
    private options;
    private connectionState;
    private reconnectAttempts;
    private connectionListeners;
    private errorListeners;
    constructor(httpClient: HttpClient, apiKey: string);
    connect(options?: RealtimeOptions): Promise<void>;
    disconnect(): void;
    isConnected(): boolean;
    getConnectionState(): string;
    private setupEventHandlers;
    private handleDatabaseChange;
    private handleChannelMessage;
    private handlePresenceUpdate;
    private handleWorkflowEvent;
    private handleLogicEvent;
    private handleAnalyticsUpdate;
    subscribeToTable(tableName: string, callback: (event: {
        type: 'INSERT' | 'UPDATE' | 'DELETE';
        table: string;
        record: any;
        old_record?: any;
        timestamp: string;
    }) => void, options?: DatabaseSubscriptionOptions): Promise<() => void>;
    unsubscribeFromTable(tableName: string): Promise<void>;
    subscribeToChannel(channelName: string, callback: (message: any) => void): Promise<() => void>;
    unsubscribeFromChannel(channelName: string): Promise<void>;
    publishToChannel(channelName: string, message: any): Promise<void>;
    joinPresence(channelName: string, userInfo: PresenceUser, callback: (presence: PresenceUpdate) => void): Promise<() => void>;
    leavePresence(channelName: string): Promise<void>;
    updatePresence(channelName: string, userInfo: Partial<PresenceUser>): Promise<void>;
    getPresence(channelName: string): Promise<PresenceUser[]>;
    subscribeToWorkflow(workflowId: string, callback: (event: {
        type: 'started' | 'completed' | 'failed' | 'step_completed' | 'step_failed';
        workflow_id: string;
        execution_id: string;
        step_name?: string;
        data?: any;
        error?: string;
        timestamp: string;
    }) => void): Promise<() => void>;
    unsubscribeFromWorkflow(workflowId: string): Promise<void>;
    subscribeToLogic(logicName: string, callback: (event: {
        type: 'execution.started' | 'execution.completed' | 'execution.failed';
        logic_name: string;
        execution_id: string;
        data?: any;
        error?: string;
        timestamp: string;
    }) => void): Promise<() => void>;
    unsubscribeFromLogic(logicName: string): Promise<void>;
    subscribeToAnalytics(type: 'system' | 'table' | 'workflow', targetId: string, callback: (metrics: {
        timestamp: string;
        metrics: Record<string, number>;
        labels?: Record<string, string>;
    }) => void, options?: {
        interval?: number;
        metrics?: string[];
    }): Promise<() => void>;
    unsubscribeFromAnalytics(type: string, targetId: string): Promise<void>;
    getActiveSubscriptions(): Array<{
        id: string;
        type: string;
        active: boolean;
    }>;
    getActiveChannels(): Array<{
        name: string;
        subscribers: number;
    }>;
    unsubscribeAll(): void;
    getConnectionStatus(): {
        connected: boolean;
        state: string;
        reconnectAttempts: number;
        maxReconnectAttempts: number;
        subscriptionCount: number;
        channelCount: number;
        presenceChannelCount: number;
    };
    onConnectionStateChange(callback: (connected: boolean) => void): () => void;
    onError(callback: (error: any) => void): () => void;
    private ensureConnected;
    private resubscribeAll;
    private notifyConnectionChange;
    private notifyError;
    private log;
}
//# sourceMappingURL=realtime.d.ts.map