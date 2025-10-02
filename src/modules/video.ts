import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../types';

// Video Types

/**
 * Video room configuration options
 */
export interface CreateRoomOptions {
  name: string;
  description?: string;
  maxParticipants?: number;
  recordingEnabled?: boolean;
  videoQuality?: 'low' | 'medium' | 'high' | 'hd' | '4k';
  audioOnly?: boolean;
  e2eeEnabled?: boolean;
  metadata?: Record<string, any>;
  roomType?: 'group' | 'p2p' | 'webinar';
  expiresAt?: Date | string;
  webhookUrl?: string;
  lockOnJoin?: boolean;
}

/**
 * Video room details
 */
export interface VideoRoom {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'ended' | 'expired';
  maxParticipants: number;
  currentParticipants: number;
  recordingEnabled: boolean;
  videoQuality: string;
  audioOnly: boolean;
  e2eeEnabled: boolean;
  roomType: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  startedAt?: string;
  endedAt?: string;
  joinUrl?: string;
  embedUrl?: string;
}

/**
 * Room filters for listing
 */
export interface RoomFilters {
  status?: 'active' | 'inactive' | 'ended' | 'expired';
  roomType?: 'group' | 'p2p' | 'webinar';
  createdAfter?: Date | string;
  createdBefore?: Date | string;
  limit?: number;
  offset?: number;
}

/**
 * Options for generating room access token
 */
export interface TokenOptions {
  permissions?: {
    canPublish?: boolean;
    canSubscribe?: boolean;
    canPublishData?: boolean;
    canUpdateMetadata?: boolean;
    hidden?: boolean;
    recorder?: boolean;
  };
  metadata?: Record<string, any>;
  expiresIn?: number; // Seconds
  maxDuration?: number; // Seconds
}

/**
 * Room access token
 */
export interface RoomToken {
  token: string;
  roomId: string;
  identity: string;
  expiresAt: string;
  permissions: {
    canPublish: boolean;
    canSubscribe: boolean;
    canPublishData: boolean;
    canUpdateMetadata: boolean;
    hidden: boolean;
    recorder: boolean;
  };
}

/**
 * Participant in a video room
 */
export interface Participant {
  id: string;
  identity: string;
  roomId: string;
  name?: string;
  status: 'joined' | 'left' | 'disconnected';
  isPublishing: boolean;
  isSpeaking: boolean;
  metadata?: Record<string, any>;
  tracks: ParticipantTrack[];
  joinedAt: string;
  leftAt?: string;
  connectionQuality?: 'excellent' | 'good' | 'poor';
}

/**
 * Media track published by participant
 */
export interface ParticipantTrack {
  id: string;
  type: 'audio' | 'video' | 'screenshare';
  source: 'camera' | 'microphone' | 'screen';
  enabled: boolean;
  muted: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Recording configuration
 */
export interface RecordingConfig {
  layout?: 'grid' | 'speaker' | 'custom';
  width?: number;
  height?: number;
  videoBitrate?: number;
  audioBitrate?: number;
  fps?: number;
  outputFormat?: 'mp4' | 'webm' | 'hls';
  storageUrl?: string;
  webhookUrl?: string;
}

/**
 * Recording details
 */
export interface Recording {
  id: string;
  sessionId: string;
  roomId: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  config: RecordingConfig;
  startedAt: string;
  endedAt?: string;
  duration?: number; // Seconds
  fileSize?: number; // Bytes
  downloadUrl?: string;
  streamUrl?: string;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Session filters for querying
 */
export interface SessionFilters {
  roomId?: string;
  startedAfter?: Date | string;
  startedBefore?: Date | string;
  endedAfter?: Date | string;
  endedBefore?: Date | string;
  minDuration?: number;
  maxDuration?: number;
  limit?: number;
  offset?: number;
}

/**
 * Video session details
 */
export interface VideoSession {
  id: string;
  roomId: string;
  roomName: string;
  startedAt: string;
  endedAt?: string;
  duration?: number; // Seconds
  participantCount: number;
  maxParticipants: number;
  recordingId?: string;
  metadata?: Record<string, any>;
}

/**
 * Session statistics
 */
export interface SessionStats {
  sessionId: string;
  roomId: string;
  duration: number;
  participantCount: number;
  totalPublishTime: number; // Seconds
  totalSubscribeTime: number; // Seconds
  averageConnectionQuality: number;
  peakParticipants: number;
  totalBytesReceived: number;
  totalBytesSent: number;
  participants: Array<{
    identity: string;
    joinedAt: string;
    leftAt?: string;
    duration: number;
    publishedTracks: number;
    subscribedTracks: number;
    connectionQuality: string;
  }>;
  qualityMetrics: {
    averageBitrate: number;
    packetLoss: number;
    jitter: number;
    roundTripTime: number;
  };
}

/**
 * Update room configuration
 */
export interface UpdateRoomOptions {
  name?: string;
  description?: string;
  maxParticipants?: number;
  recordingEnabled?: boolean;
  metadata?: Record<string, any>;
  lockOnJoin?: boolean;
}

/**
 * Egress (streaming/recording) options
 */
export interface EgressOptions {
  roomId: string;
  type: 'rtmp' | 'hls' | 'file';
  rtmpUrl?: string;
  rtmpKey?: string;
  hlsSegmentDuration?: number;
  fileOutputOptions?: RecordingConfig;
}

/**
 * Egress details
 */
export interface Egress {
  id: string;
  roomId: string;
  type: 'rtmp' | 'hls' | 'file';
  status: 'starting' | 'active' | 'stopping' | 'stopped' | 'failed';
  startedAt: string;
  endedAt?: string;
  error?: string;
  streamUrl?: string;
  playlistUrl?: string;
}

/**
 * Webhook event types for room events
 */
export interface RoomWebhookEvent {
  event: 'room.created' | 'room.ended' | 'participant.joined' | 'participant.left' | 'recording.started' | 'recording.completed';
  roomId: string;
  timestamp: string;
  data: Record<string, any>;
}

/**
 * Video Client for managing video conferencing
 */
export class VideoClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;

  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }

  // ============================================
  // Room Management
  // ============================================

  /**
   * Create a new video room
   *
   * @param options - Room configuration options
   * @returns Created room details
   *
   * @example
   * ```typescript
   * const room = await client.video.createRoom({
   *   name: 'Team Standup',
   *   description: 'Daily team standup meeting',
   *   maxParticipants: 10,
   *   recordingEnabled: true,
   *   videoQuality: 'hd'
   * });
   * console.log(`Room created: ${room.joinUrl}`);
   * ```
   */
  async createRoom(options: CreateRoomOptions): Promise<VideoRoom> {
    try {
      this.logger.debug('Creating video room', options);

      const response = await this.httpClient.post<ApiResponse<VideoRoom>>(
        '/video/rooms',
        options
      );

      this.logger.info('Video room created', { id: response.data.data.id, name: options.name });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to create video room', error);
      throw error;
    }
  }

  /**
   * Get room details
   *
   * @param roomId - Room identifier
   * @returns Room details
   *
   * @example
   * ```typescript
   * const room = await client.video.getRoom('room_abc123');
   * console.log(`Participants: ${room.currentParticipants}/${room.maxParticipants}`);
   * ```
   */
  async getRoom(roomId: string): Promise<VideoRoom> {
    try {
      this.logger.debug('Getting video room', { roomId });

      const response = await this.httpClient.get<ApiResponse<VideoRoom>>(
        `/video/rooms/${roomId}`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get video room', error);
      throw error;
    }
  }

  /**
   * List all rooms with optional filters
   *
   * @param filters - Optional filters for room listing
   * @returns Array of rooms
   *
   * @example
   * ```typescript
   * const activeRooms = await client.video.listRooms({
   *   status: 'active',
   *   limit: 20
   * });
   * ```
   */
  async listRooms(filters?: RoomFilters): Promise<VideoRoom[]> {
    try {
      this.logger.debug('Listing video rooms', filters);

      const response = await this.httpClient.get<ApiResponse<{ rooms: VideoRoom[]; total: number }>>(
        '/video/rooms',
        { params: filters }
      );

      return response.data.data.rooms;
    } catch (error) {
      this.logger.error('Failed to list video rooms', error);
      throw error;
    }
  }

  /**
   * Update room configuration
   *
   * @param roomId - Room identifier
   * @param updates - Room updates
   * @returns Updated room details
   *
   * @example
   * ```typescript
   * const room = await client.video.updateRoom('room_abc123', {
   *   maxParticipants: 20,
   *   lockOnJoin: true
   * });
   * ```
   */
  async updateRoom(roomId: string, updates: UpdateRoomOptions): Promise<VideoRoom> {
    try {
      this.logger.debug('Updating video room', { roomId, updates });

      const response = await this.httpClient.put<ApiResponse<VideoRoom>>(
        `/video/rooms/${roomId}`,
        updates
      );

      this.logger.info('Video room updated', { roomId });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to update video room', error);
      throw error;
    }
  }

  /**
   * Delete a room
   *
   * @param roomId - Room identifier
   *
   * @example
   * ```typescript
   * await client.video.deleteRoom('room_abc123');
   * ```
   */
  async deleteRoom(roomId: string): Promise<void> {
    try {
      this.logger.debug('Deleting video room', { roomId });

      await this.httpClient.delete(`/video/rooms/${roomId}`);

      this.logger.info('Video room deleted', { roomId });
    } catch (error) {
      this.logger.error('Failed to delete video room', error);
      throw error;
    }
  }

  /**
   * End an active room session
   *
   * @param roomId - Room identifier
   *
   * @example
   * ```typescript
   * await client.video.endRoom('room_abc123');
   * ```
   */
  async endRoom(roomId: string): Promise<void> {
    try {
      this.logger.debug('Ending video room', { roomId });

      await this.httpClient.post(`/video/rooms/${roomId}/end`);

      this.logger.info('Video room ended', { roomId });
    } catch (error) {
      this.logger.error('Failed to end video room', error);
      throw error;
    }
  }

  // ============================================
  // Participant Management
  // ============================================

  /**
   * Generate access token for participant
   *
   * @param roomId - Room identifier
   * @param identity - Unique participant identifier
   * @param options - Token configuration options
   * @returns Room access token
   *
   * @example
   * ```typescript
   * const token = await client.video.generateToken(
   *   'room_abc123',
   *   'user_123',
   *   {
   *     permissions: {
   *       canPublish: true,
   *       canSubscribe: true
   *     },
   *     expiresIn: 3600 // 1 hour
   *   }
   * );
   * // Send token to client to join the room
   * ```
   */
  async generateToken(roomId: string, identity: string, options?: TokenOptions): Promise<RoomToken> {
    try {
      this.logger.debug('Generating room token', { roomId, identity });

      const response = await this.httpClient.post<ApiResponse<RoomToken>>(
        `/video/rooms/${roomId}/tokens`,
        {
          identity,
          ...options,
        }
      );

      this.logger.info('Room token generated', { roomId, identity });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to generate room token', error);
      throw error;
    }
  }

  /**
   * List participants in a room
   *
   * @param roomId - Room identifier
   * @returns Array of participants
   *
   * @example
   * ```typescript
   * const participants = await client.video.listParticipants('room_abc123');
   * console.log(`Active participants: ${participants.length}`);
   * ```
   */
  async listParticipants(roomId: string): Promise<Participant[]> {
    try {
      this.logger.debug('Listing room participants', { roomId });

      const response = await this.httpClient.get<ApiResponse<{ participants: Participant[] }>>(
        `/video/rooms/${roomId}/participants`
      );

      return response.data.data.participants;
    } catch (error) {
      this.logger.error('Failed to list room participants', error);
      throw error;
    }
  }

  /**
   * Get specific participant details
   *
   * @param roomId - Room identifier
   * @param participantId - Participant identifier
   * @returns Participant details
   *
   * @example
   * ```typescript
   * const participant = await client.video.getParticipant('room_abc123', 'user_123');
   * ```
   */
  async getParticipant(roomId: string, participantId: string): Promise<Participant> {
    try {
      this.logger.debug('Getting participant details', { roomId, participantId });

      const response = await this.httpClient.get<ApiResponse<Participant>>(
        `/video/rooms/${roomId}/participants/${participantId}`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get participant details', error);
      throw error;
    }
  }

  /**
   * Remove participant from room
   *
   * @param roomId - Room identifier
   * @param participantId - Participant identifier
   *
   * @example
   * ```typescript
   * await client.video.removeParticipant('room_abc123', 'user_123');
   * ```
   */
  async removeParticipant(roomId: string, participantId: string): Promise<void> {
    try {
      this.logger.debug('Removing participant', { roomId, participantId });

      await this.httpClient.delete(`/video/rooms/${roomId}/participants/${participantId}`);

      this.logger.info('Participant removed', { roomId, participantId });
    } catch (error) {
      this.logger.error('Failed to remove participant', error);
      throw error;
    }
  }

  /**
   * Update participant metadata
   *
   * @param roomId - Room identifier
   * @param participantId - Participant identifier
   * @param metadata - Metadata updates
   *
   * @example
   * ```typescript
   * await client.video.updateParticipantMetadata('room_abc123', 'user_123', {
   *   role: 'moderator',
   *   handRaised: true
   * });
   * ```
   */
  async updateParticipantMetadata(
    roomId: string,
    participantId: string,
    metadata: Record<string, any>
  ): Promise<Participant> {
    try {
      this.logger.debug('Updating participant metadata', { roomId, participantId });

      const response = await this.httpClient.patch<ApiResponse<Participant>>(
        `/video/rooms/${roomId}/participants/${participantId}`,
        { metadata }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to update participant metadata', error);
      throw error;
    }
  }

  // ============================================
  // Recording Management
  // ============================================

  /**
   * Start recording a room session
   *
   * @param roomId - Room identifier
   * @param config - Recording configuration
   * @returns Recording details
   *
   * @example
   * ```typescript
   * const recording = await client.video.startRecording('room_abc123', {
   *   layout: 'speaker',
   *   outputFormat: 'mp4',
   *   width: 1920,
   *   height: 1080
   * });
   * ```
   */
  async startRecording(roomId: string, config?: RecordingConfig): Promise<Recording> {
    try {
      this.logger.debug('Starting room recording', { roomId, config });

      const response = await this.httpClient.post<ApiResponse<Recording>>(
        `/video/rooms/${roomId}/recording`,
        config
      );

      this.logger.info('Room recording started', { roomId, recordingId: response.data.data.id });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to start room recording', error);
      throw error;
    }
  }

  /**
   * Stop an active recording
   *
   * @param recordingId - Recording identifier
   *
   * @example
   * ```typescript
   * await client.video.stopRecording('rec_abc123');
   * ```
   */
  async stopRecording(recordingId: string): Promise<void> {
    try {
      this.logger.debug('Stopping recording', { recordingId });

      await this.httpClient.post(`/video/recordings/${recordingId}/stop`);

      this.logger.info('Recording stopped', { recordingId });
    } catch (error) {
      this.logger.error('Failed to stop recording', error);
      throw error;
    }
  }

  /**
   * Get recording details
   *
   * @param recordingId - Recording identifier
   * @returns Recording details
   *
   * @example
   * ```typescript
   * const recording = await client.video.getRecording('rec_abc123');
   * if (recording.status === 'completed') {
   *   console.log(`Download: ${recording.downloadUrl}`);
   * }
   * ```
   */
  async getRecording(recordingId: string): Promise<Recording> {
    try {
      this.logger.debug('Getting recording details', { recordingId });

      const response = await this.httpClient.get<ApiResponse<Recording>>(
        `/video/recordings/${recordingId}`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get recording details', error);
      throw error;
    }
  }

  /**
   * List recordings for a room
   *
   * @param roomId - Room identifier
   * @returns Array of recordings
   *
   * @example
   * ```typescript
   * const recordings = await client.video.listRecordings('room_abc123');
   * ```
   */
  async listRecordings(roomId: string): Promise<Recording[]> {
    try {
      this.logger.debug('Listing recordings', { roomId });

      const response = await this.httpClient.get<ApiResponse<{ recordings: Recording[] }>>(
        `/video/rooms/${roomId}/recordings`
      );

      return response.data.data.recordings;
    } catch (error) {
      this.logger.error('Failed to list recordings', error);
      throw error;
    }
  }

  /**
   * Delete a recording
   *
   * @param recordingId - Recording identifier
   *
   * @example
   * ```typescript
   * await client.video.deleteRecording('rec_abc123');
   * ```
   */
  async deleteRecording(recordingId: string): Promise<void> {
    try {
      this.logger.debug('Deleting recording', { recordingId });

      await this.httpClient.delete(`/video/recordings/${recordingId}`);

      this.logger.info('Recording deleted', { recordingId });
    } catch (error) {
      this.logger.error('Failed to delete recording', error);
      throw error;
    }
  }

  // ============================================
  // Session Management
  // ============================================

  /**
   * Get session history with optional filters
   *
   * @param filters - Optional filters for session query
   * @returns Array of sessions
   *
   * @example
   * ```typescript
   * const sessions = await client.video.getSessions({
   *   startedAfter: '2024-01-01',
   *   minDuration: 300 // 5 minutes
   * });
   * ```
   */
  async getSessions(filters?: SessionFilters): Promise<VideoSession[]> {
    try {
      this.logger.debug('Getting video sessions', filters);

      const response = await this.httpClient.get<ApiResponse<{ sessions: VideoSession[] }>>(
        '/video/sessions',
        { params: filters }
      );

      return response.data.data.sessions;
    } catch (error) {
      this.logger.error('Failed to get video sessions', error);
      throw error;
    }
  }

  /**
   * Get detailed statistics for a session
   *
   * @param sessionId - Session identifier
   * @returns Session statistics
   *
   * @example
   * ```typescript
   * const stats = await client.video.getSessionStats('session_abc123');
   * console.log(`Peak participants: ${stats.peakParticipants}`);
   * console.log(`Average quality: ${stats.averageConnectionQuality}`);
   * ```
   */
  async getSessionStats(sessionId: string): Promise<SessionStats> {
    try {
      this.logger.debug('Getting session stats', { sessionId });

      const response = await this.httpClient.get<ApiResponse<SessionStats>>(
        `/video/sessions/${sessionId}/stats`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get session stats', error);
      throw error;
    }
  }

  // ============================================
  // Egress (Streaming/Recording)
  // ============================================

  /**
   * Start egress (RTMP streaming or HLS)
   *
   * @param options - Egress configuration
   * @returns Egress details
   *
   * @example
   * ```typescript
   * // Stream to YouTube
   * const egress = await client.video.startEgress({
   *   roomId: 'room_abc123',
   *   type: 'rtmp',
   *   rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
   *   rtmpKey: 'your-stream-key'
   * });
   * ```
   */
  async startEgress(options: EgressOptions): Promise<Egress> {
    try {
      this.logger.debug('Starting egress', options);

      const response = await this.httpClient.post<ApiResponse<Egress>>(
        '/video/egress',
        options
      );

      this.logger.info('Egress started', { id: response.data.data.id });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to start egress', error);
      throw error;
    }
  }

  /**
   * Stop an active egress
   *
   * @param egressId - Egress identifier
   *
   * @example
   * ```typescript
   * await client.video.stopEgress('egress_abc123');
   * ```
   */
  async stopEgress(egressId: string): Promise<void> {
    try {
      this.logger.debug('Stopping egress', { egressId });

      await this.httpClient.post(`/video/egress/${egressId}/stop`);

      this.logger.info('Egress stopped', { egressId });
    } catch (error) {
      this.logger.error('Failed to stop egress', error);
      throw error;
    }
  }

  /**
   * Get egress details
   *
   * @param egressId - Egress identifier
   * @returns Egress details
   */
  async getEgress(egressId: string): Promise<Egress> {
    try {
      const response = await this.httpClient.get<ApiResponse<Egress>>(
        `/video/egress/${egressId}`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get egress details', error);
      throw error;
    }
  }
}
