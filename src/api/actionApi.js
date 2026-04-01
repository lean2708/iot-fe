const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

/**
 * Gửi lệnh điều khiển thiết bị → POST /actions/control
 * @param {number} deviceId  – ID thiết bị (1=Light, 2=Fan, 3=TV)
 * @param {'ON'|'OFF'} action – Lệnh muốn gửi
 * @returns {Promise<{id, deviceId, action, status, createdAt, updatedAt}>}
 */
export async function controlDevice(deviceId, action) {
  const response = await fetch(`${API_BASE_URL}/actions/control`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify({ deviceId, action }),
  })

  if (!response.ok) {
    throw new Error(`Control request failed (${response.status})`)
  }

  const payload = await response.json()
  if (!payload?.success) {
    throw new Error(payload?.message || 'Control request unsuccessful')
  }

  return payload.data
}

export async function getDevices() {
  const response = await fetch(`${API_BASE_URL}/devices`, {
    headers: {
      accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch devices (${response.status})`)
  }

  const payload = await response.json()
  return Array.isArray(payload?.data) ? payload.data : []
}

export async function searchActionHistory({
  pageNo = 1,
  pageSize = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  deviceName = '',
  searchBy = 'action',
  searchValue = '',
} = {}) {
  const query = new URLSearchParams({
    pageNo: String(pageNo),
    pageSize: String(pageSize),
    sortBy,
    sortOrder,
  })

  const trimmedDeviceName = deviceName.trim()
  if (trimmedDeviceName) {
    query.set('deviceName', trimmedDeviceName)
  }

  const trimmedSearchValue = searchValue.trim()
  if (trimmedSearchValue) {
    query.set('searchBy', searchBy)
    query.set('searchValue', trimmedSearchValue)
  }

  const response = await fetch(`${API_BASE_URL}/actions/search?${query.toString()}`, {
    headers: {
      accept: '*/*',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch actions (${response.status})`)
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
