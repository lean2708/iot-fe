export function formatClock(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDelta(value) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value}%`
}

export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const remain = minutes % 60
  return `${hours}h ${remain}m`
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
