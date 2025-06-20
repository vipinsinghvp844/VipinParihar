self.addEventListener('install', (event) => {
  // console.log('Service Worker Installed');
});

self.addEventListener('activate', (event) => {
  // console.log('Service Worker Activated');
});

// Periodic Syncing
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'auto-checkout') {
    event.waitUntil(
      fetchShiftAndAttendanceData()
        .then(data => {
          if (data.shouldAutoCheckOut) {
            return autoCheckOutAndBreakOut();
          }
        })
        .catch((error) => console.error('Error in periodic sync:', error))
    );
  }
});

async function fetchShiftAndAttendanceData() {
  const shiftEndResponse = await fetch(`${import.meta.env.VITE_API_SHIFTS}`);
  const shifts = await shiftEndResponse.json();
  const activeShift = shifts.find(shift => shift.shift_status === 'active');
  const shiftEndTime = activeShift ? activeShift.end_time : null;

  const attendanceResponse = await fetch('https://your-attendance-api-url');
  const attendanceData = await attendanceResponse.json();

  // Logic to check if auto-checkout is needed
  const shouldAutoCheckOut = (someConditionBasedOnTime(shiftEndTime));

  return { shouldAutoCheckOut };
}

async function autoCheckOutAndBreakOut() {
  // Call attendance API to perform check-out and break-out
  const userId = localStorage.getItem('user_id');
  const time = new Date().toLocaleTimeString(); // Set current time as check-out/break-out time
  const payload = {
    user_id: userId,
    time: time,
    type: 'clock_out' // or 'break_out'
  };

  await fetch('https://your-attendance-api-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}
