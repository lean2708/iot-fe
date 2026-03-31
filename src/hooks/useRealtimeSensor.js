import { useEffect, useRef, useState } from 'react'
import socket from '../socket/socketClient'

const SOCKET_TOPIC = import.meta.env.VITE_SOCKET_TOPIC || 'sensor-data'

// Giữ tối đa MAX_HISTORY điểm trong chart history
const MAX_HISTORY = 48

/**
 * useRealtimeSensor
 *
 * Lắng nghe socket event "sensor-data" từ backend.
 * Backend emit: { temperature, humidity, light, timestamp }
 *
 * Trả về:
 *   - liveMetrics: { temperature, humidity, light } — giá trị mới nhất (dùng cho MetricCard)
 *   - liveHistory: { temperature[], humidity[], light[] } — rolling buffer (dùng cho ChartCard)
 *   - connected: boolean
 */
export function useRealtimeSensor(initialMetrics, initialHistory) {
  const [connected, setConnected] = useState(socket.connected)

  // Metrics realtime: khởi tạo từ snapshot API, cập nhật khi socket emit
  const [liveMetrics, setLiveMetrics] = useState(initialMetrics)

  // History rolling buffer: khởi tạo từ snapshot API
  const [liveHistory, setLiveHistory] = useState(initialHistory)

  // Track LED usage time (tính từ thời gian relay bật — xem note bên dưới)
  const ledStartRef = useRef(null)
  const [ledUsageMinutes, setLedUsageMinutes] = useState(
    initialMetrics?.ledUsage?.value ?? 0,
  )

  // Cập nhật initial khi snapshot API load xong
  useEffect(() => {
    if (initialMetrics) setLiveMetrics(initialMetrics)
  }, [initialMetrics])

  useEffect(() => {
    if (initialHistory) setLiveHistory(initialHistory)
  }, [initialHistory])

  useEffect(() => {
    // --- Socket connection state ---
    function onConnect() {
      setConnected(true)
    }
    function onDisconnect() {
      setConnected(false)
    }

    // --- Main sensor handler ---
    function onSensorData(data) {
      const { temperature, humidity, light } = data

      // 1. Cập nhật MetricCard (giá trị tức thời)
      setLiveMetrics((prev) => ({
        ...prev,
        temperature: {
          ...prev?.temperature,
          value: temperature ?? prev?.temperature?.value,
        },
        humidity: {
          ...prev?.humidity,
          value: humidity ?? prev?.humidity?.value,
        },
        light: {
          ...prev?.light,
          value: light ?? prev?.light?.value,
        },
      }))

      // 2. Thêm điểm mới vào history chart (rolling buffer)
      setLiveHistory((prev) => {
        if (!prev) return prev

        const appendAndTrim = (arr, val) => {
          if (val == null) return arr
          const next = [...arr, val]
          return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next
        }

        return {
          ...prev,
          temperature: appendAndTrim(prev.temperature, temperature),
          humidity: appendAndTrim(prev.humidity, humidity),
          light: appendAndTrim(prev.light, light),
        }
      })
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on(SOCKET_TOPIC, onSensorData)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off(SOCKET_TOPIC, onSensorData)
    }
  }, [])

  return { liveMetrics, liveHistory, ledUsageMinutes, connected }
}
