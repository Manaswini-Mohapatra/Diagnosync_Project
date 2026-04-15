/**
 * videoCall.js — Video Consultation helper (Phase 4.7)
 *
 * Uses Jitsi Meet public servers (meet.jit.si) — free, no account needed.
 * Room name is derived from appointmentId so both parties always join the same room.
 */

/**
 * Opens a Jitsi video call in a new browser tab.
 * @param {string} appointmentId  - The MongoDB _id of the appointment
 * @param {string} [displayName]  - Optional: participant's display name
 */
export function joinVideoCall(appointmentId, displayName = '') {
  if (!appointmentId) {
    alert('Cannot start call: appointment ID is missing.');
    return;
  }

  // Room name: long enough to be practically unguessable
  const roomName = `diagnosync-appt-${appointmentId}`;

  // Build the Jitsi URL with optional display name pre-filled
  const nameParam = displayName
    ? `#userInfo.displayName="${encodeURIComponent(displayName)}"`
    : '';

  const url = `https://meet.jit.si/${roomName}${nameParam}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}
