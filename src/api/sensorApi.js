const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

export async function getSensors() {
  const response = await fetch(`${API_BASE_URL}/sensors`, {
    headers: {
      accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch sensors (${response.status})`)
  }

  const payload = await response.json()
  return Array.isArray(payload?.data) ? payload.data : []
}

export async function searchSensorHistory({
  pageNo = 1,
  pageSize = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  sensorName = '',
  searchBy = 'value',
  searchValue = '',
} = {}) {
  const query = new URLSearchParams({
    pageNo: String(pageNo),
    pageSize: String(pageSize),
    sortBy,
    sortOrder,
  })

  const trimmedSensorName = sensorName.trim()
  if (trimmedSensorName) {
    query.set('sensorName', trimmedSensorName)
  }

  const trimmedSearchValue = searchValue.trim()
  if (trimmedSearchValue) {
    query.set('searchBy', searchBy)
    query.set('searchValue', trimmedSearchValue)
  }

  const response = await fetch(`${API_BASE_URL}/data-sensors/search?${query.toString()}`, {
    headers: {
      accept: '*/*',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch sensor history (${response.status})`)
  }

  const payload = await response.json()
  const rows = Array.isArray(payload?.data) ? payload.data : []
  const pagination = payload?.pagination || {}

  return {
    rows,
    pagination: {
      pageNo: Number(pagination.pageNo || pageNo),
      pageSize: Number(pagination.pageSize || pageSize),
      total: Number(pagination.total || 0),
      totalPages: Number(pagination.totalPages || 1),
    },
  }
}
