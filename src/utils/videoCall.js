export function joinVideoCall(appointmentId, displayName = '') {
  if (!appointmentId) {
    alert('Cannot start call: appointment ID is missing.');
    return;
  }
 
  const roomName = `diagnosync-appt-${appointmentId}`;
  const nameParam = displayName
    ? `#userInfo.displayName="${encodeURIComponent(displayName)}"`
    : '';

  const url = `https://meet.jit.si/${roomName}${nameParam}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}
