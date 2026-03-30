const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

export async function getUserProfile(userId = '1') {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: {
      accept: '*/*',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile (${response.status})`)
  }

  const payload = await response.json()
  const user = payload?.data?.user

  if (!user) {
    throw new Error('Invalid user response payload')
  }

  return user
}

export async function updateUserProfile(userId = '1', profilePayload = {}) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profilePayload),
  })

  if (!response.ok) {
    throw new Error(`Failed to update user profile (${response.status})`)
  }

  const payload = await response.json()
  const user = payload?.data?.user

  if (!user) {
    throw new Error('Invalid update user response payload')
  }

  return user
}
