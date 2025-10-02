/**
 * Fluxez SDK - Video Conferencing Examples
 *
 * This example demonstrates how to use the Video module for:
 * - Creating and managing video rooms
 * - Generating participant tokens
 * - Managing participants
 * - Recording sessions
 * - Session analytics
 * - Live streaming (egress)
 */

const { FluxezClient } = require('../dist');
require('dotenv').config();

const client = new FluxezClient(process.env.FLUXEZ_API_KEY || 'service_your_key_here');

async function videoConferencingExamples() {
  console.log('=== Fluxez Video Conferencing Examples ===\n');

  try {
    // ============================================
    // 1. Create Video Room
    // ============================================
    console.log('1. Creating a video room...');
    const room = await client.video.createRoom({
      name: 'Team Standup Meeting',
      description: 'Daily team standup',
      maxParticipants: 10,
      recordingEnabled: true,
      videoQuality: 'hd',
      roomType: 'group',
      e2eeEnabled: true,
      metadata: {
        teamId: 'team_123',
        meetingType: 'standup'
      }
    });
    console.log(`✓ Room created: ${room.id}`);
    console.log(`  Join URL: ${room.joinUrl}`);
    console.log(`  Max participants: ${room.maxParticipants}`);
    console.log();

    // ============================================
    // 2. Generate Participant Tokens
    // ============================================
    console.log('2. Generating participant tokens...');

    // Token for regular participant
    const userToken = await client.video.generateToken(
      room.id,
      'user_john_doe',
      {
        permissions: {
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          canUpdateMetadata: false
        },
        metadata: {
          name: 'John Doe',
          role: 'participant',
          avatar: 'https://example.com/avatar.jpg'
        },
        expiresIn: 3600 // 1 hour
      }
    );
    console.log(`✓ User token generated for: user_john_doe`);
    console.log(`  Can publish: ${userToken.permissions.canPublish}`);
    console.log(`  Expires at: ${userToken.expiresAt}`);

    // Token for moderator
    const modToken = await client.video.generateToken(
      room.id,
      'user_jane_moderator',
      {
        permissions: {
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          canUpdateMetadata: true,
          hidden: false
        },
        metadata: {
          name: 'Jane Smith',
          role: 'moderator'
        },
        expiresIn: 7200 // 2 hours
      }
    );
    console.log(`✓ Moderator token generated for: user_jane_moderator`);
    console.log();

    // ============================================
    // 3. List and Manage Participants
    // ============================================
    console.log('3. Managing participants...');

    // List all participants
    const participants = await client.video.listParticipants(room.id);
    console.log(`✓ Current participants: ${participants.length}`);
    participants.forEach(p => {
      console.log(`  - ${p.identity}: ${p.status} (publishing: ${p.isPublishing})`);
    });

    // Update participant metadata
    if (participants.length > 0) {
      const updated = await client.video.updateParticipantMetadata(
        room.id,
        participants[0].id,
        {
          handRaised: true,
          reactions: ['👍']
        }
      );
      console.log(`✓ Updated metadata for ${updated.identity}`);
    }
    console.log();

    // ============================================
    // 4. Room Recording
    // ============================================
    console.log('4. Managing room recordings...');

    const recording = await client.video.startRecording(room.id, {
      layout: 'speaker',
      width: 1920,
      height: 1080,
      fps: 30,
      outputFormat: 'mp4',
      videoBitrate: 3000000,
      audioBitrate: 128000,
      webhookUrl: 'https://example.com/webhook/recording'
    });
    console.log(`✓ Recording started: ${recording.id}`);
    console.log(`  Status: ${recording.status}`);
    console.log(`  Format: ${recording.config.outputFormat}`);

    // Simulate recording...
    console.log('  Recording in progress...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Stop recording
    await client.video.stopRecording(recording.id);
    console.log(`✓ Recording stopped`);

    // Get recording details
    const recordingDetails = await client.video.getRecording(recording.id);
    console.log(`  Status: ${recordingDetails.status}`);
    if (recordingDetails.downloadUrl) {
      console.log(`  Download URL: ${recordingDetails.downloadUrl}`);
    }
    console.log();

    // ============================================
    // 5. List All Recordings
    // ============================================
    console.log('5. Listing room recordings...');
    const recordings = await client.video.listRecordings(room.id);
    console.log(`✓ Found ${recordings.length} recordings`);
    recordings.forEach(rec => {
      console.log(`  - ${rec.id}: ${rec.status} (${rec.duration || 0}s)`);
    });
    console.log();

    // ============================================
    // 6. Live Streaming (Egress)
    // ============================================
    console.log('6. Setting up live streaming...');

    // Stream to RTMP (e.g., YouTube, Twitch)
    const egress = await client.video.startEgress({
      roomId: room.id,
      type: 'rtmp',
      rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
      rtmpKey: 'your-stream-key-here'
    });
    console.log(`✓ Live stream started: ${egress.id}`);
    console.log(`  Type: ${egress.type}`);
    console.log(`  Status: ${egress.status}`);

    // Wait a bit...
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Stop egress
    await client.video.stopEgress(egress.id);
    console.log(`✓ Live stream stopped`);
    console.log();

    // ============================================
    // 7. List Active Rooms
    // ============================================
    console.log('7. Listing video rooms...');

    const activeRooms = await client.video.listRooms({
      status: 'active',
      limit: 10
    });
    console.log(`✓ Found ${activeRooms.length} active rooms`);
    activeRooms.forEach(r => {
      console.log(`  - ${r.name}: ${r.currentParticipants}/${r.maxParticipants} participants`);
    });

    const allRooms = await client.video.listRooms({
      createdAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      limit: 20
    });
    console.log(`✓ Created in last 24h: ${allRooms.length} rooms`);
    console.log();

    // ============================================
    // 8. Update Room Configuration
    // ============================================
    console.log('8. Updating room configuration...');

    const updatedRoom = await client.video.updateRoom(room.id, {
      maxParticipants: 20,
      lockOnJoin: true,
      metadata: {
        ...room.metadata,
        updated: new Date().toISOString()
      }
    });
    console.log(`✓ Room updated: ${updatedRoom.id}`);
    console.log(`  New max participants: ${updatedRoom.maxParticipants}`);
    console.log(`  Lock on join: ${updatedRoom.lockOnJoin || false}`);
    console.log();

    // ============================================
    // 9. Session Analytics
    // ============================================
    console.log('9. Getting session analytics...');

    // Get session history
    const sessions = await client.video.getSessions({
      roomId: room.id,
      limit: 5
    });
    console.log(`✓ Found ${sessions.length} sessions`);

    if (sessions.length > 0) {
      const session = sessions[0];
      console.log(`  Latest session: ${session.id}`);
      console.log(`  Duration: ${session.duration || 0}s`);
      console.log(`  Participants: ${session.participantCount}`);

      // Get detailed session stats
      const stats = await client.video.getSessionStats(session.id);
      console.log(`  Peak participants: ${stats.peakParticipants}`);
      console.log(`  Average quality: ${stats.averageConnectionQuality}`);
      console.log(`  Total bytes sent: ${(stats.totalBytesSent / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Participants details:`);
      stats.participants.forEach(p => {
        console.log(`    - ${p.identity}: ${p.duration}s, quality: ${p.connectionQuality}`);
      });
    }
    console.log();

    // ============================================
    // 10. Advanced Room Features
    // ============================================
    console.log('10. Advanced room features...');

    // Create a webinar room
    const webinarRoom = await client.video.createRoom({
      name: 'Product Launch Webinar',
      description: 'Live product demonstration',
      maxParticipants: 1000,
      recordingEnabled: true,
      videoQuality: 'hd',
      roomType: 'webinar',
      metadata: {
        eventType: 'webinar',
        speakers: ['John Doe', 'Jane Smith']
      }
    });
    console.log(`✓ Webinar room created: ${webinarRoom.id}`);
    console.log(`  Type: ${webinarRoom.roomType}`);
    console.log(`  Max participants: ${webinarRoom.maxParticipants}`);

    // Create a 1-on-1 room
    const p2pRoom = await client.video.createRoom({
      name: 'Sales Call with Customer',
      maxParticipants: 2,
      roomType: 'p2p',
      e2eeEnabled: true,
      recordingEnabled: false
    });
    console.log(`✓ P2P room created: ${p2pRoom.id}`);
    console.log(`  Type: ${p2pRoom.roomType}`);
    console.log(`  E2E encryption: ${p2pRoom.e2eeEnabled}`);
    console.log();

    // ============================================
    // 11. Remove Participant
    // ============================================
    console.log('11. Removing participant...');

    if (participants.length > 0) {
      await client.video.removeParticipant(room.id, participants[0].id);
      console.log(`✓ Removed participant: ${participants[0].identity}`);
    }
    console.log();

    // ============================================
    // 12. End Room Session
    // ============================================
    console.log('12. Ending room sessions...');

    await client.video.endRoom(room.id);
    console.log(`✓ Room session ended: ${room.id}`);

    await client.video.endRoom(webinarRoom.id);
    console.log(`✓ Webinar session ended: ${webinarRoom.id}`);

    await client.video.endRoom(p2pRoom.id);
    console.log(`✓ P2P session ended: ${p2pRoom.id}`);
    console.log();

    // ============================================
    // 13. Cleanup - Delete Rooms
    // ============================================
    console.log('13. Cleaning up...');

    await client.video.deleteRoom(room.id);
    console.log(`✓ Deleted room: ${room.id}`);

    await client.video.deleteRoom(webinarRoom.id);
    console.log(`✓ Deleted webinar room: ${webinarRoom.id}`);

    await client.video.deleteRoom(p2pRoom.id);
    console.log(`✓ Deleted p2p room: ${p2pRoom.id}`);
    console.log();

    console.log('✓ All video conferencing examples completed!');

  } catch (error) {
    console.error('Error in video conferencing examples:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Real-world use case example
async function videoCallWorkflow() {
  console.log('\n=== Real-world Video Call Workflow ===\n');

  try {
    // Step 1: Create room for team meeting
    const meeting = await client.video.createRoom({
      name: 'Sprint Planning Meeting',
      description: 'Q1 2024 Sprint Planning',
      maxParticipants: 15,
      recordingEnabled: true,
      videoQuality: 'hd',
      roomType: 'group',
      metadata: {
        department: 'Engineering',
        sprint: 'Q1-2024-Sprint-1'
      }
    });
    console.log(`Meeting room created: ${meeting.joinUrl}`);

    // Step 2: Generate tokens for team members
    const teamMembers = [
      { id: 'user_1', name: 'John (Product Manager)', role: 'moderator' },
      { id: 'user_2', name: 'Sarah (Engineer)', role: 'participant' },
      { id: 'user_3', name: 'Mike (Designer)', role: 'participant' },
    ];

    console.log('\nGenerating access tokens:');
    for (const member of teamMembers) {
      const token = await client.video.generateToken(
        meeting.id,
        member.id,
        {
          permissions: {
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
            canUpdateMetadata: member.role === 'moderator'
          },
          metadata: {
            name: member.name,
            role: member.role
          },
          expiresIn: 7200 // 2 hours
        }
      );
      console.log(`  ✓ ${member.name}: ${token.token.substring(0, 20)}...`);
    }

    // Step 3: Start recording
    console.log('\nStarting meeting recording...');
    const recording = await client.video.startRecording(meeting.id, {
      layout: 'grid',
      width: 1920,
      height: 1080,
      outputFormat: 'mp4'
    });
    console.log(`  ✓ Recording started: ${recording.id}`);

    // Step 4: Simulate meeting duration
    console.log('\nMeeting in progress...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 5: End meeting and stop recording
    console.log('\nEnding meeting...');
    await client.video.stopRecording(recording.id);
    await client.video.endRoom(meeting.id);
    console.log('  ✓ Meeting ended');

    // Step 6: Get meeting analytics
    const sessions = await client.video.getSessions({ roomId: meeting.id });
    if (sessions.length > 0) {
      const stats = await client.video.getSessionStats(sessions[0].id);
      console.log('\nMeeting Summary:');
      console.log(`  Duration: ${stats.duration}s`);
      console.log(`  Participants: ${stats.participantCount}`);
      console.log(`  Peak participants: ${stats.peakParticipants}`);
      console.log(`  Average quality: ${stats.averageConnectionQuality}`);
    }

    // Cleanup
    await client.video.deleteRoom(meeting.id);
    console.log('\n✓ Workflow completed successfully!');

  } catch (error) {
    console.error('Error in video call workflow:', error.message);
  }
}

// Run examples
if (require.main === module) {
  videoConferencingExamples()
    .then(() => videoCallWorkflow())
    .then(() => {
      console.log('\n✓ All examples completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n✗ Example failed:', error);
      process.exit(1);
    });
}

module.exports = { videoConferencingExamples, videoCallWorkflow };
