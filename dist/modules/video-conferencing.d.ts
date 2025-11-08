import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
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
 * Video room details (matches backend API response)
 */
export interface VideoRoom {
    id?: string;
    roomId?: string;
    roomName?: string;
    name?: string;
    description?: string;
    status?: 'active' | 'inactive' | 'ended' | 'expired';
    maxParticipants?: number;
    currentParticipants?: number;
    recordingEnabled?: boolean;
    videoQuality?: string;
    audioOnly?: boolean;
    e2eeEnabled?: boolean;
    roomType?: string;
    metadata?: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
    expiresAt?: string;
    startedAt?: string;
    endedAt?: string;
    joinUrl?: string;
    embedUrl?: string;
    session?: {
        id: string;
        roomId: string;
        roomName: string;
        organizationId?: string;
        projectId?: string;
        status: string;
        maxParticipants: number;
        [key: string]: any;
    };
    participants?: any[];
    liveParticipants?: any[];
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
    name?: string;
    canPublish?: boolean;
    canSubscribe?: boolean;
    canPublishData?: boolean;
    permissions?: {
        canPublish?: boolean;
        canSubscribe?: boolean;
        canPublishData?: boolean;
        canUpdateMetadata?: boolean;
        hidden?: boolean;
        recorder?: boolean;
    };
    metadata?: Record<string, any>;
    expiresIn?: number;
    maxDuration?: number;
}
/**
 * Room access token (matches backend API response)
 */
export interface RoomToken {
    token: string;
    url?: string;
    roomId?: string;
    roomName?: string;
    identity: string;
    expiresAt?: string;
    permissions?: {
        canPublish?: boolean;
        canSubscribe?: boolean;
        canPublishData?: boolean;
        canUpdateMetadata?: boolean;
        hidden?: boolean;
        recorder?: boolean;
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
    duration?: number;
    fileSize?: number;
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
    duration?: number;
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
    totalPublishTime: number;
    totalSubscribeTime: number;
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
 * Video Conferencing Client for managing video conferencing
 */
export declare class VideoConferencingClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Create a new video room
     *
     * @param options - Room configuration options
     * @returns Created room details
     *
     * @example
     * ```typescript
     * const room = await client.videoConferencing.createRoom({
     *   roomName: 'Team Standup',
     *   displayName: 'Daily team standup meeting',
     *   maxParticipants: 10,
     *   recordingEnabled: true
     * });
     * console.log(`Room created: ${room.id}`);
     * ```
     */
    createRoom(options: any): Promise<any>;
    /**
     * Get room details
     *
     * @param roomName - Room name
     * @returns Room details
     *
     * @example
     * ```typescript
     * const room = await client.videoConferencing.getRoom('my-room-name');
     * console.log(`Status: ${room.session.status}`);
     * ```
     */
    getRoom(roomName: string): Promise<any>;
    /**
     * List all rooms with optional filters
     *
     * @param filters - Optional filters for room listing
     * @returns Array of rooms
     *
     * @example
     * ```typescript
     * const activeRooms = await client.videoConferencing.listRooms({
     *   status: 'active',
     *   limit: 20
     * });
     * ```
     */
    listRooms(filters?: RoomFilters): Promise<VideoRoom[]>;
    /**
     * Update room configuration
     *
     * @param roomId - Room identifier
     * @param updates - Room updates
     * @returns Updated room details
     *
     * @example
     * ```typescript
     * const room = await client.videoConferencing.updateRoom('room_abc123', {
     *   maxParticipants: 20,
     *   lockOnJoin: true
     * });
     * ```
     */
    updateRoom(roomId: string, updates: UpdateRoomOptions): Promise<VideoRoom>;
    /**
     * Delete a room
     *
     * @param roomId - Room identifier
     *
     * @example
     * ```typescript
     * await client.videoConferencing.deleteRoom('room_abc123');
     * ```
     */
    deleteRoom(roomId: string): Promise<void>;
    /**
     * End an active room session
     *
     * @param roomId - Room identifier
     *
     * @example
     * ```typescript
     * await client.videoConferencing.endRoom('room_abc123');
     * ```
     */
    endRoom(roomId: string): Promise<void>;
    /**
     * Generate access token for participant
     *
     * @param roomName - Room name (not ID)
     * @param identity - Unique participant identifier
     * @param options - Token configuration options
     * @returns Room access token
     *
     * @example
     * ```typescript
     * const token = await client.videoConferencing.generateToken(
     *   'my-room-name',
     *   'user_123',
     *   {
     *     name: 'John Doe',
     *     canPublish: true,
     *     canSubscribe: true,
     *     canPublishData: true
     *   }
     * );
     * // Send token to client to join the room
     * ```
     */
    generateToken(roomName: string, identity: string, options?: any): Promise<any>;
    /**
     * List participants in a room
     *
     * @param roomId - Room identifier
     * @returns Array of participants
     *
     * @example
     * ```typescript
     * const participants = await client.videoConferencing.listParticipants('room_abc123');
     * console.log(`Active participants: ${participants.length}`);
     * ```
     */
    listParticipants(roomId: string): Promise<Participant[]>;
    /**
     * Get specific participant details
     *
     * @param roomId - Room identifier
     * @param participantId - Participant identifier
     * @returns Participant details
     *
     * @example
     * ```typescript
     * const participant = await client.videoConferencing.getParticipant('room_abc123', 'user_123');
     * ```
     */
    getParticipant(roomId: string, participantId: string): Promise<Participant>;
    /**
     * Remove participant from room
     *
     * @param roomId - Room identifier
     * @param participantId - Participant identifier
     *
     * @example
     * ```typescript
     * await client.videoConferencing.removeParticipant('room_abc123', 'user_123');
     * ```
     */
    removeParticipant(roomId: string, participantId: string): Promise<void>;
    /**
     * Update participant metadata
     *
     * @param roomId - Room identifier
     * @param participantId - Participant identifier
     * @param metadata - Metadata updates
     *
     * @example
     * ```typescript
     * await client.videoConferencing.updateParticipantMetadata('room_abc123', 'user_123', {
     *   role: 'moderator',
     *   handRaised: true
     * });
     * ```
     */
    updateParticipantMetadata(roomId: string, participantId: string, metadata: Record<string, any>): Promise<Participant>;
    /**
     * Start recording a room session
     *
     * @param roomId - Room identifier
     * @param config - Recording configuration
     * @returns Recording details
     *
     * @example
     * ```typescript
     * const recording = await client.videoConferencing.startRecording('room_abc123', {
     *   layout: 'speaker',
     *   outputFormat: 'mp4',
     *   width: 1920,
     *   height: 1080
     * });
     * ```
     */
    startRecording(roomId: string, config?: RecordingConfig): Promise<Recording>;
    /**
     * Stop an active recording
     *
     * @param roomId - Room identifier
     * @param recordingId - Recording identifier (egress ID)
     *
     * @example
     * ```typescript
     * await client.videoConferencing.stopRecording('room_abc123', 'EG_xyz789');
     * ```
     */
    stopRecording(roomId: string, recordingId: string): Promise<void>;
    /**
     * Get recording details
     *
     * @param roomId - Room identifier
     * @returns Recording details
     *
     * @example
     * ```typescript
     * const recording = await client.videoConferencing.getRecording('room_abc123');
     * if (recording.status === 'completed') {
     *   console.log(`Download: ${recording.downloadUrl}`);
     * }
     * ```
     */
    getRecording(roomId: string): Promise<Recording>;
    /**
     * List recordings for a room
     *
     * @param roomId - Room identifier
     * @returns Array of recordings
     *
     * @example
     * ```typescript
     * const recordings = await client.videoConferencing.listRecordings('room_abc123');
     * ```
     */
    listRecordings(roomId: string): Promise<Recording[]>;
    /**
     * Delete a recording
     *
     * @param recordingId - Recording identifier
     *
     * @example
     * ```typescript
     * await client.videoConferencing.deleteRecording('rec_abc123');
     * ```
     */
    deleteRecording(recordingId: string): Promise<void>;
    /**
     * Get session history with optional filters
     *
     * @param filters - Optional filters for session query
     * @returns Array of sessions
     *
     * @example
     * ```typescript
     * const sessions = await client.videoConferencing.getSessions({
     *   startedAfter: '2024-01-01',
     *   minDuration: 300 // 5 minutes
     * });
     * ```
     */
    getSessions(filters?: SessionFilters): Promise<VideoSession[]>;
    /**
     * Get detailed statistics for a session
     *
     * @param sessionId - Session identifier
     * @returns Session statistics
     *
     * @example
     * ```typescript
     * const stats = await client.videoConferencing.getSessionStats('session_abc123');
     * console.log(`Peak participants: ${stats.peakParticipants}`);
     * console.log(`Average quality: ${stats.averageConnectionQuality}`);
     * ```
     */
    getSessionStats(sessionId: string): Promise<SessionStats>;
    /**
     * Start egress (RTMP streaming or HLS)
     *
     * @param options - Egress configuration
     * @returns Egress details
     *
     * @example
     * ```typescript
     * // Stream to YouTube
     * const egress = await client.videoConferencing.startEgress({
     *   roomId: 'room_abc123',
     *   type: 'rtmp',
     *   rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
     *   rtmpKey: 'your-stream-key'
     * });
     * ```
     */
    startEgress(options: EgressOptions): Promise<Egress>;
    /**
     * Stop an active egress
     *
     * @param egressId - Egress identifier
     *
     * @example
     * ```typescript
     * await client.videoConferencing.stopEgress('egress_abc123');
     * ```
     */
    stopEgress(egressId: string): Promise<void>;
    /**
     * Get egress details
     *
     * @param egressId - Egress identifier
     * @returns Egress details
     */
    getEgress(egressId: string): Promise<Egress>;
}
//# sourceMappingURL=video-conferencing.d.ts.map