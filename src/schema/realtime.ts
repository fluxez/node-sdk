import { Socket, io } from 'socket.io-client';
import { HttpClient } from '../core/http-client';
import { RealtimeSubscription, RealtimeChannel } from '../types';
import { FLUXEZ_BASE_URL } from '../constants';

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
  left: Array<{ id: string; left_at: string }>;
  updated: PresenceUser[];
}

export class RealtimeModule {
  private httpClient: HttpClient;
  private apiKey: string;
  private socket: Socket | null = null;
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private channels: Map<string, RealtimeChannel> = new Map();
  private presenceChannels: Map<string, Map<string, PresenceUser>> = new Map();
  private options: RealtimeOptions = {};
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private reconnectAttempts = 0;
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private errorListeners: Array<(error: any) => void> = [];

  constructor(httpClient: HttpClient, apiKey: string) {
    this.httpClient = httpClient;
    this.apiKey = apiKey;
  }

  // Connection management
  async connect(options: RealtimeOptions = {}): Promise<void> {
    if (this.socket && this.socket.connected) {
      return;
    }

    this.options = {
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      timeout: 10000,
      debug: false,
      ...options,
    };

    // Extract base URL without /api/v1 for WebSocket connection
    const realtimeUrl = FLUXEZ_BASE_URL.replace('/api/v1', '');
    
    this.connectionState = 'connecting';
    this.log('Connecting to realtime server...');

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(realtimeUrl, {
          path: '/socket.io/',
          query: {
            apiKey: this.apiKey,
          },
          timeout: this.options.timeout,
          autoConnect: true,
          reconnection: this.options.autoReconnect,
          reconnectionAttempts: this.options.maxReconnectAttempts,
          reconnectionDelay: this.options.reconnectDelay,
          transports: ['websocket', 'polling'],
          withCredentials: true,
        });

        this.setupEventHandlers();

        this.socket.on('connect', () => {
          this.log('Socket.io connected, waiting for authentication...');
        });

        this.socket.on('connected', (data: any) => {
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.log('Connected to realtime server with auth:', data);
          this.notifyConnectionChange(true);
          resolve();
        });

        this.socket.on('connect_error', (error: any) => {
          this.connectionState = 'disconnected';
          this.log('Connection error:', error);
          this.notifyError(error);
          reject(error);
        });

        this.socket.on('error', (data: any) => {
          this.connectionState = 'disconnected';
          this.log('Authentication error:', data);
          this.notifyError(new Error(data.message || 'Authentication failed'));
          reject(new Error(data.message || 'Authentication failed'));
        });

        this.socket.on('disconnect', (reason: any) => {
          this.connectionState = 'disconnected';
          this.log('Disconnected from realtime server:', reason);
          this.notifyConnectionChange(false);
        });

        this.socket.on('reconnect', (attemptNumber: number) => {
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.log(`Reconnected after ${attemptNumber} attempts`);
          this.notifyConnectionChange(true);
          this.resubscribeAll();
        });

        this.socket.on('reconnect_attempt', (attemptNumber: number) => {
          this.connectionState = 'reconnecting';
          this.reconnectAttempts = attemptNumber;
          this.log(`Reconnection attempt ${attemptNumber}`);
        });

        this.socket.on('reconnect_error', (error: any) => {
          this.log('Reconnection error:', error);
          this.notifyError(error);
        });

        this.socket.on('reconnect_failed', () => {
          this.connectionState = 'disconnected';
          this.log('Reconnection failed after maximum attempts');
          this.notifyError(new Error('Reconnection failed'));
        });

      } catch (error) {
        this.connectionState = 'disconnected';
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionState = 'disconnected';
    this.subscriptions.clear();
    this.channels.clear();
    this.presenceChannels.clear();
    this.log('Disconnected from realtime server');
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): string {
    return this.connectionState;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Database change events
    this.socket.on('database_change', (data: any) => {
      this.handleDatabaseChange(data);
    });

    // Channel messages
    this.socket.on('channel_message', (data: any) => {
      this.handleChannelMessage(data);
    });

    // Presence updates
    this.socket.on('presence_update', (data: any) => {
      this.handlePresenceUpdate(data);
    });

    // Workflow events
    this.socket.on('workflow_event', (data: any) => {
      this.handleWorkflowEvent(data);
    });

    // Logic events
    this.socket.on('logic_event', (data: any) => {
      this.handleLogicEvent(data);
    });

    // Analytics events
    this.socket.on('analytics_update', (data: any) => {
      this.handleAnalyticsUpdate(data);
    });

    // Error handling
    this.socket.on('error', (error: any) => {
      this.log('Socket error:', error);
      this.notifyError(error);
    });

    // Subscription confirmations
    this.socket.on('subscription_confirmed', (data: any) => {
      this.log('Subscription confirmed:', data);
    });

    this.socket.on('subscription_error', (data: any) => {
      this.log('Subscription error:', data);
      this.notifyError(new Error(data.message || 'Subscription error'));
    });
  }

  private handleDatabaseChange(data: any): void {
    const subscriptionId = `database:${data.table}`;
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (subscription) {
      try {
        subscription.callback(data);
      } catch (error) {
        this.log('Error in database change callback:', error);
        this.notifyError(error);
      }
    }
  }

  private handleChannelMessage(data: any): void {
    const channel = this.channels.get(data.channel);
    
    if (channel) {
      try {
        channel.callback(data.message);
      } catch (error) {
        this.log('Error in channel message callback:', error);
        this.notifyError(error);
      }
    }
  }

  private handlePresenceUpdate(data: any): void {
    const subscriptionId = `presence:${data.channel}`;
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (subscription) {
      // Update local presence state
      if (!this.presenceChannels.has(data.channel)) {
        this.presenceChannels.set(data.channel, new Map());
      }
      
      const presenceMap = this.presenceChannels.get(data.channel)!;
      
      // Process presence updates
      const update: PresenceUpdate = {
        joined: [],
        left: [],
        updated: [],
      };
      
      if (data.joined) {
        data.joined.forEach((user: PresenceUser) => {
          presenceMap.set(user.id, user);
          update.joined.push(user);
        });
      }
      
      if (data.left) {
        data.left.forEach((userId: string) => {
          const user = presenceMap.get(userId);
          if (user) {
            presenceMap.delete(userId);
            update.left.push({ id: userId, left_at: new Date().toISOString() });
          }
        });
      }
      
      if (data.updated) {
        data.updated.forEach((user: PresenceUser) => {
          presenceMap.set(user.id, user);
          update.updated.push(user);
        });
      }
      
      try {
        subscription.callback(update);
      } catch (error) {
        this.log('Error in presence update callback:', error);
        this.notifyError(error);
      }
    }
  }

  private handleWorkflowEvent(data: any): void {
    const subscriptionId = `workflow:${data.workflow_id}`;
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (subscription) {
      try {
        subscription.callback(data);
      } catch (error) {
        this.log('Error in workflow event callback:', error);
        this.notifyError(error);
      }
    }
  }

  private handleLogicEvent(data: any): void {
    const subscriptionId = `logic:${data.logic_name}`;
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (subscription) {
      try {
        subscription.callback(data);
      } catch (error) {
        this.log('Error in logic event callback:', error);
        this.notifyError(error);
      }
    }
  }

  private handleAnalyticsUpdate(data: any): void {
    const subscriptionId = `analytics:${data.type}:${data.target_id}`;
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (subscription) {
      try {
        subscription.callback(data);
      } catch (error) {
        this.log('Error in analytics update callback:', error);
        this.notifyError(error);
      }
    }
  }

  // Database subscriptions
  async subscribeToTable(
    tableName: string,
    callback: (event: {
      type: 'INSERT' | 'UPDATE' | 'DELETE';
      table: string;
      record: any;
      old_record?: any;
      timestamp: string;
    }) => void,
    options: DatabaseSubscriptionOptions = {}
  ): Promise<() => void> {
    if (!this.ensureConnected()) {
      throw new Error('Not connected to realtime server');
    }

    const subscriptionId = `database:${tableName}`;
    
    // Remove existing subscription if present
    if (this.subscriptions.has(subscriptionId)) {
      await this.unsubscribeFromTable(tableName);
    }

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      type: 'database',
      callback,
      active: true,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Send subscription request to server
    this.socket!.emit('subscribe_table', {
      table: tableName,
      events: options.events || ['INSERT', 'UPDATE', 'DELETE'],
      filter: options.filter,
      realtime: options.realtime !== false,
    });

    this.log(`Subscribed to table: ${tableName}`);

    // Return unsubscribe function
    return () => this.unsubscribeFromTable(tableName);
  }

  async unsubscribeFromTable(tableName: string): Promise<void> {
    const subscriptionId = `database:${tableName}`;
    
    if (this.subscriptions.has(subscriptionId)) {
      this.subscriptions.delete(subscriptionId);
      
      if (this.socket?.connected) {
        this.socket.emit('unsubscribe_table', { table: tableName });
      }
      
      this.log(`Unsubscribed from table: ${tableName}`);
    }
  }

  // Channel subscriptions (pub/sub)
  async subscribeToChannel(
    channelName: string,
    callback: (message: any) => void
  ): Promise<() => void> {
    if (!this.ensureConnected()) {
      throw new Error('Not connected to realtime server');
    }

    // Remove existing subscription if present
    if (this.channels.has(channelName)) {
      await this.unsubscribeFromChannel(channelName);
    }

    const channel: RealtimeChannel = {
      name: channelName,
      callback,
      subscribers: 1,
    };

    this.channels.set(channelName, channel);

    // Send subscription request to server
    this.socket!.emit('subscribe_channel', { channel: channelName });

    this.log(`Subscribed to channel: ${channelName}`);

    // Return unsubscribe function
    return () => this.unsubscribeFromChannel(channelName);
  }

  async unsubscribeFromChannel(channelName: string): Promise<void> {
    if (this.channels.has(channelName)) {
      this.channels.delete(channelName);
      
      if (this.socket?.connected) {
        this.socket.emit('unsubscribe_channel', { channel: channelName });
      }
      
      this.log(`Unsubscribed from channel: ${channelName}`);
    }
  }

  async publishToChannel(channelName: string, message: any): Promise<void> {
    if (!this.ensureConnected()) {
      throw new Error('Not connected to realtime server');
    }

    this.socket!.emit('publish_channel', {
      channel: channelName,
      message,
    });

    this.log(`Published to channel: ${channelName}`);
  }

  // Presence tracking
  async joinPresence(
    channelName: string,
    userInfo: PresenceUser,
    callback: (presence: PresenceUpdate) => void
  ): Promise<() => void> {
    if (!this.ensureConnected()) {
      throw new Error('Not connected to realtime server');
    }

    const subscriptionId = `presence:${channelName}`;
    
    // Remove existing subscription if present
    if (this.subscriptions.has(subscriptionId)) {
      await this.leavePresence(channelName);
    }

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      type: 'presence',
      callback,
      active: true,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Initialize presence channel if not exists
    if (!this.presenceChannels.has(channelName)) {
      this.presenceChannels.set(channelName, new Map());
    }

    // Send join request to server
    this.socket!.emit('join_presence', {
      channel: channelName,
      user: userInfo,
    });

    this.log(`Joined presence channel: ${channelName}`);

    // Return leave function
    return () => this.leavePresence(channelName);
  }

  async leavePresence(channelName: string): Promise<void> {
    const subscriptionId = `presence:${channelName}`;
    
    if (this.subscriptions.has(subscriptionId)) {
      this.subscriptions.delete(subscriptionId);
      
      if (this.socket?.connected) {
        this.socket.emit('leave_presence', { channel: channelName });
      }
      
      this.presenceChannels.delete(channelName);
      this.log(`Left presence channel: ${channelName}`);
    }
  }

  async updatePresence(
    channelName: string,
    userInfo: Partial<PresenceUser>
  ): Promise<void> {
    if (!this.ensureConnected()) {
      throw new Error('Not connected to realtime server');
    }

    this.socket!.emit('update_presence', {
      channel: channelName,
      user: userInfo,
    });

    this.log(`Updated presence in channel: ${channelName}`);
  }

  async getPresence(channelName: string): Promise<PresenceUser[]> {
    if (!this.ensureConnected()) {
      throw new Error('Not connected to realtime server');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Presence request timeout'));
      }, 5000);

      this.socket!.emit('get_presence', { channel: channelName }, (response: any) => {
        clearTimeout(timeout);
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.users || []);
        }
      });
    });
  }

  // Workflow event subscriptions
  async subscribeToWorkflow(
    workflowId: string,
    callback: (event: {
      type: 'started' | 'completed' | 'failed' | 'step_completed' | 'step_failed';
      workflow_id: string;
      execution_id: string;
      step_name?: string;
      data?: any;
      error?: string;
      timestamp: string;
    }) => void
  ): Promise<() => void> {
    if (!this.ensureConnected()) {
      throw new Error('Not connected to realtime server');
    }

    const subscriptionId = `workflow:${workflowId}`;
    
    // Remove existing subscription if present
    if (this.subscriptions.has(subscriptionId)) {
      await this.unsubscribeFromWorkflow(workflowId);
    }

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      type: 'workflow',
      callback,
      active: true,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Send subscription request to server
    this.socket!.emit('subscribe_workflow', { workflow_id: workflowId });

    this.log(`Subscribed to workflow: ${workflowId}`);

    // Return unsubscribe function
    return () => this.unsubscribeFromWorkflow(workflowId);
  }

  async unsubscribeFromWorkflow(workflowId: string): Promise<void> {
    const subscriptionId = `workflow:${workflowId}`;
    
    if (this.subscriptions.has(subscriptionId)) {
      this.subscriptions.delete(subscriptionId);
      
      if (this.socket?.connected) {
        this.socket.emit('unsubscribe_workflow', { workflow_id: workflowId });
      }
      
      this.log(`Unsubscribed from workflow: ${workflowId}`);
    }
  }

  // Logic event subscriptions
  async subscribeToLogic(
    logicName: string,
    callback: (event: {
      type: 'execution.started' | 'execution.completed' | 'execution.failed';
      logic_name: string;
      execution_id: string;
      data?: any;
      error?: string;
      timestamp: string;
    }) => void
  ): Promise<() => void> {
    if (!this.ensureConnected()) {
      throw new Error('Not connected to realtime server');
    }

    const subscriptionId = `logic:${logicName}`;
    
    // Remove existing subscription if present
    if (this.subscriptions.has(subscriptionId)) {
      await this.unsubscribeFromLogic(logicName);
    }

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      type: 'logic',
      callback,
      active: true,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Send subscription request to server
    this.socket!.emit('subscribe_logic', { logic_name: logicName });

    this.log(`Subscribed to logic: ${logicName}`);

    // Return unsubscribe function
    return () => this.unsubscribeFromLogic(logicName);
  }

  async unsubscribeFromLogic(logicName: string): Promise<void> {
    const subscriptionId = `logic:${logicName}`;
    
    if (this.subscriptions.has(subscriptionId)) {
      this.subscriptions.delete(subscriptionId);
      
      if (this.socket?.connected) {
        this.socket.emit('unsubscribe_logic', { logic_name: logicName });
      }
      
      this.log(`Unsubscribed from logic: ${logicName}`);
    }
  }

  // Real-time analytics
  async subscribeToAnalytics(
    type: 'system' | 'table' | 'workflow',
    targetId: string,
    callback: (metrics: {
      timestamp: string;
      metrics: Record<string, number>;
      labels?: Record<string, string>;
    }) => void,
    options: {
      interval?: number;
      metrics?: string[];
    } = {}
  ): Promise<() => void> {
    if (!this.ensureConnected()) {
      throw new Error('Not connected to realtime server');
    }

    const subscriptionId = `analytics:${type}:${targetId}`;
    
    // Remove existing subscription if present
    if (this.subscriptions.has(subscriptionId)) {
      await this.unsubscribeFromAnalytics(type, targetId);
    }

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      type: 'analytics',
      callback,
      active: true,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Send subscription request to server
    this.socket!.emit('subscribe_analytics', {
      type,
      target_id: targetId,
      interval: options.interval || 30,
      metrics: options.metrics,
    });

    this.log(`Subscribed to analytics: ${type}:${targetId}`);

    // Return unsubscribe function
    return () => this.unsubscribeFromAnalytics(type, targetId);
  }

  async unsubscribeFromAnalytics(type: string, targetId: string): Promise<void> {
    const subscriptionId = `analytics:${type}:${targetId}`;
    
    if (this.subscriptions.has(subscriptionId)) {
      this.subscriptions.delete(subscriptionId);
      
      if (this.socket?.connected) {
        this.socket.emit('unsubscribe_analytics', {
          type,
          target_id: targetId,
        });
      }
      
      this.log(`Unsubscribed from analytics: ${type}:${targetId}`);
    }
  }

  // Subscription management
  getActiveSubscriptions(): Array<{
    id: string;
    type: string;
    active: boolean;
  }> {
    return Array.from(this.subscriptions.values()).map(sub => ({
      id: sub.id,
      type: sub.type,
      active: sub.active,
    }));
  }

  getActiveChannels(): Array<{
    name: string;
    subscribers: number;
  }> {
    return Array.from(this.channels.values()).map(channel => ({
      name: channel.name,
      subscribers: channel.subscribers,
    }));
  }

  unsubscribeAll(): void {
    // Unsubscribe from all database subscriptions
    for (const [id, subscription] of this.subscriptions) {
      if (subscription.type === 'database') {
        const tableName = id.replace('database:', '');
        this.unsubscribeFromTable(tableName);
      } else if (subscription.type === 'workflow') {
        const workflowId = id.replace('workflow:', '');
        this.unsubscribeFromWorkflow(workflowId);
      } else if (subscription.type === 'logic') {
        const logicName = id.replace('logic:', '');
        this.unsubscribeFromLogic(logicName);
      } else if (subscription.type === 'presence') {
        const channelName = id.replace('presence:', '');
        this.leavePresence(channelName);
      } else if (subscription.type === 'analytics') {
        const parts = id.split(':');
        if (parts.length >= 3) {
          this.unsubscribeFromAnalytics(parts[1], parts[2]);
        }
      }
    }

    // Unsubscribe from all channels
    for (const channelName of this.channels.keys()) {
      this.unsubscribeFromChannel(channelName);
    }

    this.log('Unsubscribed from all subscriptions');
  }

  // Connection status and monitoring
  getConnectionStatus(): {
    connected: boolean;
    state: string;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    subscriptionCount: number;
    channelCount: number;
    presenceChannelCount: number;
  } {
    return {
      connected: this.isConnected(),
      state: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.options.maxReconnectAttempts || 5,
      subscriptionCount: this.subscriptions.size,
      channelCount: this.channels.size,
      presenceChannelCount: this.presenceChannels.size,
    };
  }

  // Event handlers
  onConnectionStateChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.push(callback);
    
    // Return cleanup function
    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  onError(callback: (error: any) => void): () => void {
    this.errorListeners.push(callback);
    
    // Return cleanup function
    return () => {
      const index = this.errorListeners.indexOf(callback);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  // Utility methods
  private ensureConnected(): boolean {
    if (!this.socket || !this.socket.connected) {
      return false;
    }
    return true;
  }

  private async resubscribeAll(): Promise<void> {
    this.log('Resubscribing to all subscriptions...');
    
    // Resubscribe to all active subscriptions
    for (const [id, subscription] of this.subscriptions) {
      if (!subscription.active) continue;
      
      try {
        if (subscription.type === 'database') {
          const tableName = id.replace('database:', '');
          this.socket!.emit('subscribe_table', {
            table: tableName,
            events: ['INSERT', 'UPDATE', 'DELETE'],
          });
        } else if (subscription.type === 'workflow') {
          const workflowId = id.replace('workflow:', '');
          this.socket!.emit('subscribe_workflow', { workflow_id: workflowId });
        } else if (subscription.type === 'logic') {
          const logicName = id.replace('logic:', '');
          this.socket!.emit('subscribe_logic', { logic_name: logicName });
        } else if (subscription.type === 'presence') {
          const channelName = id.replace('presence:', '');
          this.socket!.emit('join_presence', { channel: channelName });
        } else if (subscription.type === 'analytics') {
          const parts = id.split(':');
          if (parts.length >= 3) {
            this.socket!.emit('subscribe_analytics', {
              type: parts[1],
              target_id: parts[2],
            });
          }
        }
      } catch (error) {
        this.log(`Error resubscribing to ${id}:`, error);
      }
    }
    
    // Resubscribe to all channels
    for (const channelName of this.channels.keys()) {
      try {
        this.socket!.emit('subscribe_channel', { channel: channelName });
      } catch (error) {
        this.log(`Error resubscribing to channel ${channelName}:`, error);
      }
    }
    
    this.log('Resubscription completed');
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        this.log('Error in connection state callback:', error);
      }
    });
  }

  private notifyError(error: any): void {
    this.errorListeners.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        this.log('Error in error callback:', callbackError);
      }
    });
  }

  private log(message: string, ...args: any[]): void {
    if (this.options.debug) {
      console.log(`[AppAtOnce Realtime] ${message}`, ...args);
    }
  }
}