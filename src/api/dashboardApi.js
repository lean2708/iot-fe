const LATENCY_MS = 350

const state = {
  classrooms: [
    { id: 'classroom-101', name: 'Classroom 101' },
    { id: 'classroom-102', name: 'Classroom 102' },
    { id: 'lab-a', name: 'Computer Lab A' },
    { id: 'lab-b', name: 'Science Lab B' },
  ],
  devices: {
    light: { id: 'light', name: 'Main Lights', status: 'on' },
    fan: { id: 'fan', name: 'Ceiling Fan', status: 'loading' },
    tv: { id: 'tv', name: 'Smart TV', status: 'loading' },
  },
  metrics: {
    temperature: { value: 25, unit: 'C', delta: 0.5, note: 'vs last hour' },
    light: { value: 500, unit: 'Lux', delta: 2, note: 'Optimal range' },
    ledUsage: { value: 330, unit: 'min', delta: 0, note: 'Active hours tracked' },
  },
}

function delay(value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), LATENCY_MS)
  })
}

function generateSensorHistory(seed) {
  const baseTemp = [24, 23, 24, 22, 23, 24, 26, 25]
  const baseLight = [320, 380, 420, 540, 500, 470, 520, 490]
  const baseLed = [260, 280, 250, 330, 370, 340, 320, 300]

  return {
    temperature: baseTemp.map((value, idx) => value + ((seed + idx) % 2)),
    light: baseLight.map((value, idx) => value + ((seed + idx) % 3) * 8),
    led: baseLed.map((value, idx) => value + ((seed + idx) % 3) * 6),
  }
}

function classroomSeed(classroomId) {
  return state.classrooms.findIndex((item) => item.id === classroomId) + 1
}

export function getClassrooms() {
  return delay(state.classrooms)
}

export function getDashboardSnapshot(classroomId) {
  const seed = classroomSeed(classroomId)
  const history = generateSensorHistory(seed)

  return delay({
    metrics: state.metrics,
    devices: Object.values(state.devices),
    history,
  })
}

export function getTemperature() {
  return delay(state.metrics.temperature.value)
}

export function getLightIntensity() {
  return delay(state.metrics.light.value)
}

export function getLedUsage() {
  return delay(state.metrics.ledUsage.value)
}

export function toggleDevice(id, status) {
  if (state.devices[id]) {
    state.devices[id].status = status
  }

  return delay(state.devices[id])
}
