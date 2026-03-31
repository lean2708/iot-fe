import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

console.log('[Socket.io] Connecting to:', SOCKET_URL)

// Singleton: chỉ tạo 1 lần, dùng lại khắp app
// KHÔNG ép websocket-only — để Socket.io tự polling→upgrade
const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnectionDelay: 2000,
  reconnectionAttempts: 10,
})

socket.on('connect', () => {
  console.log('[Socket.io] ✅ Connected, id:', socket.id)
})

socket.on('disconnect', (reason) => {
  console.warn('[Socket.io] ❌ Disconnected:', reason)
})

socket.on('connect_error', (err) => {
  console.error('[Socket.io] 🔴 Connection error:', err.message)
})

// Debug: log TẤT CẢ event nhận được (xóa sau khi debug xong)
const _originalOnevent = socket.onevent?.bind(socket)
socket.onAny((event, ...args) => {
  console.log('[Socket.io] 📥 Event received:', event, args)
})

export default socket
