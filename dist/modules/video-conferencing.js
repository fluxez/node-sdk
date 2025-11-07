"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoConferencingClient = void 0;
/**
 * Video Conferencing Client for managing video conferencing
 */
class VideoConferencingClient {
    constructor(httpClient, config, logger) {
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
     * const room = await client.videoConferencing.createRoom({
     *   roomName: 'Team Standup',
     *   displayName: 'Daily team standup meeting',
     *   maxParticipants: 10,
     *   recordingEnabled: true
     * });
     * console.log(`Room created: ${room.id}`);
     * ```
     */
    async createRoom(options) {
        try {
            this.logger.debug('Creating video room', options);
            const payload = {
                roomName: options.roomName || options.name,
                displayName: options.displayName || options.description,
                maxParticipants: options.maxParticipants || 10,
                recordingEnabled: options.recordingEnabled || false,
                transcriptionEnabled: options.transcriptionEnabled || false,
                emptyTimeout: options.emptyTimeout || 300,
                maxDuration: options.maxDuration,
                metadata: options.metadata || {}
            };
            const response = await this.httpClient.post('/video-conferencing/rooms', payload);
            this.logger.info('Video room created', { roomName: payload.roomName });
            // Response structure: { session: { id, roomId, roomName, ... } }
            return response.data.session || response.data;
        }
        catch (error) {
            this.logger.error('Failed to create video room', error);
            throw error;
        }
    }
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
    async getRoom(roomName) {
        try {
            this.logger.debug('Getting video room', { roomName });
            const response = await this.httpClient.get(`/video-conferencing/rooms/${roomName}`);
            // Response structure: { session, participants, liveParticipants }
            return response.data;
        }
        catch (error) {
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
     * const activeRooms = await client.videoConferencing.listRooms({
     *   status: 'active',
     *   limit: 20
     * });
     * ```
     */
    async listRooms(filters) {
        try {
            this.logger.debug('Listing video rooms', filters);
            const response = await this.httpClient.get('/video-conferencing/rooms', { params: filters });
            return response.data.data.rooms;
        }
        catch (error) {
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
     * const room = await client.videoConferencing.updateRoom('room_abc123', {
     *   maxParticipants: 20,
     *   lockOnJoin: true
     * });
     * ```
     */
    async updateRoom(roomId, updates) {
        try {
            this.logger.debug('Updating video room', { roomId, updates });
            const response = await this.httpClient.put(`/video-conferencing/rooms/${roomId}`, updates);
            this.logger.info('Video room updated', { roomId });
            return response.data.data;
        }
        catch (error) {
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
     * await client.videoConferencing.deleteRoom('room_abc123');
     * ```
     */
    async deleteRoom(roomId) {
        try {
            this.logger.debug('Deleting video room', { roomId });
            await this.httpClient.delete(`/video-conferencing/rooms/${roomId}`);
            this.logger.info('Video room deleted', { roomId });
        }
        catch (error) {
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
     * await client.videoConferencing.endRoom('room_abc123');
     * ```
     */
    async endRoom(roomId) {
        try {
            this.logger.debug('Ending video room', { roomId });
            await this.httpClient.post(`/video-conferencing/rooms/${roomId}/end`);
            this.logger.info('Video room ended', { roomId });
        }
        catch (error) {
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
    async generateToken(roomName, identity, options) {
        try {
            this.logger.debug('Generating room token', { roomName, identity });
            const payload = {
                roomName: roomName,
                identity: identity,
                name: options?.name || identity,
                canPublish: options?.canPublish !== false,
                canSubscribe: options?.canSubscribe !== false,
                canPublishData: options?.canPublishData !== false,
                metadata: options?.metadata || {}
            };
            const response = await this.httpClient.post(`/video-conferencing/rooms/${roomName}/token`, payload);
            this.logger.info('Room token generated', { roomName, identity });
            // Response structure: { token, url, roomName, identity }
            return response.data;
        }
        catch (error) {
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
     * const participants = await client.videoConferencing.listParticipants('room_abc123');
     * console.log(`Active participants: ${participants.length}`);
     * ```
     */
    async listParticipants(roomId) {
        try {
            this.logger.debug('Listing room participants', { roomId });
            const response = await this.httpClient.get(`/video-conferencing/rooms/${roomId}/participants`);
            return response.data.data.participants;
        }
        catch (error) {
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
     * const participant = await client.videoConferencing.getParticipant('room_abc123', 'user_123');
     * ```
     */
    async getParticipant(roomId, participantId) {
        try {
            this.logger.debug('Getting participant details', { roomId, participantId });
            const response = await this.httpClient.get(`/video-conferencing/rooms/${roomId}/participants/${participantId}`);
            return response.data.data;
        }
        catch (error) {
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
     * await client.videoConferencing.removeParticipant('room_abc123', 'user_123');
     * ```
     */
    async removeParticipant(roomId, participantId) {
        try {
            this.logger.debug('Removing participant', { roomId, participantId });
            await this.httpClient.delete(`/video-conferencing/rooms/${roomId}/participants/${participantId}`);
            this.logger.info('Participant removed', { roomId, participantId });
        }
        catch (error) {
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
     * await client.videoConferencing.updateParticipantMetadata('room_abc123', 'user_123', {
     *   role: 'moderator',
     *   handRaised: true
     * });
     * ```
     */
    async updateParticipantMetadata(roomId, participantId, metadata) {
        try {
            this.logger.debug('Updating participant metadata', { roomId, participantId });
            const response = await this.httpClient.patch(`/video-conferencing/rooms/${roomId}/participants/${participantId}`, { metadata });
            return response.data.data;
        }
        catch (error) {
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
     * const recording = await client.videoConferencing.startRecording('room_abc123', {
     *   layout: 'speaker',
     *   outputFormat: 'mp4',
     *   width: 1920,
     *   height: 1080
     * });
     * ```
     */
    async startRecording(roomId, config) {
        try {
            this.logger.debug('Starting room recording', { roomId, config });
            const response = await this.httpClient.post(`/video-conferencing/rooms/${roomId}/recording`, config);
            this.logger.info('Room recording started', { roomId, recordingId: response.data.data.id });
            return response.data.data;
        }
        catch (error) {
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
     * await client.videoConferencing.stopRecording('rec_abc123');
     * ```
     */
    async stopRecording(recordingId) {
        try {
            this.logger.debug('Stopping recording', { recordingId });
            await this.httpClient.post(`/video-conferencing/recordings/${recordingId}/stop`);
            this.logger.info('Recording stopped', { recordingId });
        }
        catch (error) {
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
     * const recording = await client.videoConferencing.getRecording('rec_abc123');
     * if (recording.status === 'completed') {
     *   console.log(`Download: ${recording.downloadUrl}`);
     * }
     * ```
     */
    async getRecording(recordingId) {
        try {
            this.logger.debug('Getting recording details', { recordingId });
            const response = await this.httpClient.get(`/video-conferencing/recordings/${recordingId}`);
            return response.data.data;
        }
        catch (error) {
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
     * const recordings = await client.videoConferencing.listRecordings('room_abc123');
     * ```
     */
    async listRecordings(roomId) {
        try {
            this.logger.debug('Listing recordings', { roomId });
            const response = await this.httpClient.get(`/video-conferencing/rooms/${roomId}/recordings`);
            return response.data.data.recordings;
        }
        catch (error) {
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
     * await client.videoConferencing.deleteRecording('rec_abc123');
     * ```
     */
    async deleteRecording(recordingId) {
        try {
            this.logger.debug('Deleting recording', { recordingId });
            await this.httpClient.delete(`/video-conferencing/recordings/${recordingId}`);
            this.logger.info('Recording deleted', { recordingId });
        }
        catch (error) {
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
     * const sessions = await client.videoConferencing.getSessions({
     *   startedAfter: '2024-01-01',
     *   minDuration: 300 // 5 minutes
     * });
     * ```
     */
    async getSessions(filters) {
        try {
            this.logger.debug('Getting video sessions', filters);
            const response = await this.httpClient.get('/video-conferencing/sessions', { params: filters });
            return response.data.data.sessions;
        }
        catch (error) {
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
     * const stats = await client.videoConferencing.getSessionStats('session_abc123');
     * console.log(`Peak participants: ${stats.peakParticipants}`);
     * console.log(`Average quality: ${stats.averageConnectionQuality}`);
     * ```
     */
    async getSessionStats(sessionId) {
        try {
            this.logger.debug('Getting session stats', { sessionId });
            const response = await this.httpClient.get(`/video-conferencing/sessions/${sessionId}/stats`);
            return response.data.data;
        }
        catch (error) {
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
     * const egress = await client.videoConferencing.startEgress({
     *   roomId: 'room_abc123',
     *   type: 'rtmp',
     *   rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
     *   rtmpKey: 'your-stream-key'
     * });
     * ```
     */
    async startEgress(options) {
        try {
            this.logger.debug('Starting egress', options);
            const response = await this.httpClient.post('/video-conferencing/egress', options);
            this.logger.info('Egress started', { id: response.data.data.id });
            return response.data.data;
        }
        catch (error) {
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
     * await client.videoConferencing.stopEgress('egress_abc123');
     * ```
     */
    async stopEgress(egressId) {
        try {
            this.logger.debug('Stopping egress', { egressId });
            await this.httpClient.post(`/video-conferencing/egress/${egressId}/stop`);
            this.logger.info('Egress stopped', { egressId });
        }
        catch (error) {
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
    async getEgress(egressId) {
        try {
            const response = await this.httpClient.get(`/video-conferencing/egress/${egressId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get egress details', error);
            throw error;
        }
    }
}
exports.VideoConferencingClient = VideoConferencingClient;
//# sourceMappingURL=video-conferencing.js.map