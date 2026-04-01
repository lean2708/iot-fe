import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getClassrooms, getDashboardSnapshot } from '../api/dashboardApi'
import { controlDevice } from '../api/actionApi'
import { useRealtimeSensor } from './useRealtimeSensor'
import { formatClock } from '../utils/formatters'

// deviceId map: dashboard devices index → backend deviceId
const DEVICE_ID_MAP = {
  light: 1, // deviceId=1 → Main Light
  fan:   2, // deviceId=2 → Ceiling Fan
  tv:    3, // deviceId=3 → Smart TV
}

const CONTROL_TIMEOUT_MS = 10_000

export function useDashboardData(classroomId) {
  const [loading, setLoading]               = useState(true)
  const [classrooms, setClassrooms]         = useState([])
  const [snapshotMetrics, setSnapshotMetrics] = useState(null)
  const [snapshotHistory, setSnapshotHistory] = useState(null)
  const [devices, setDevices]               = useState([])
  const [clock, setClock]                   = useState(formatClock(new Date()))
  const [toasts, setToasts]                 = useState([])   // { id, type, message }

  const timeoutRefs = useRef({})  // deviceId → timeout handle

  // ── helpers ──────────────────────────────────────────────────────
  const pushToast = useCallback((type, message) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500)
  }, [])

  const patchDevice = useCallback((deviceKey, patch) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceKey ? { ...d, ...patch } : d)),
    )
  }, [])

  // ── 1. Load snapshot ban đầu từ API ──────────────────────────────
  const refreshData = useCallback(async () => {
    setLoading(true)
    const [allClassrooms, snapshot] = await Promise.all([
      getClassrooms(),
      getDashboardSnapshot(classroomId),
    ])

    setClassrooms(allClassrooms)
    setSnapshotMetrics(snapshot.metrics)
    setSnapshotHistory(snapshot.history)
    setDevices(snapshot.devices)
    setLoading(false)
  }, [classroomId])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // ── 2. Realtime overlay từ Socket.io ─────────────────────────────
  const { liveMetrics, liveHistory, connected } = useRealtimeSensor(
    snapshotMetrics,
    snapshotHistory,
  )

  // ── 3. Toggle device — full control flow ─────────────────────────
  // Steps 1-12 (success) & 5a/4a/10a/11a/12a (timeout / error)
  const onToggleDevice = useCallback(async (deviceKey, enabled) => {
    const backendDeviceId = DEVICE_ID_MAP[deviceKey]
    if (!backendDeviceId) return

    const action = enabled ? 'ON' : 'OFF'

    // Step 1→2: user tapped → set loading immediately (optimistic UI)
    patchDevice(deviceKey, { status: 'loading' })

    // Step 4a: start timeout countdown (10s)
    if (timeoutRefs.current[deviceKey]) {
      clearTimeout(timeoutRefs.current[deviceKey])
    }
    const timeoutHandle = setTimeout(() => {
      // Step 10a, 11a, 12a — timeout exceeded, device not responding
      patchDevice(deviceKey, { status: enabled ? 'off' : 'on' }) // revert
      pushToast('error', `Thiết bị không phản hồi`)
    }, CONTROL_TIMEOUT_MS)
    timeoutRefs.current[deviceKey] = timeoutHandle

    try {
      // Step 2→3→4: POST /actions/control → backend saves LOADING action
      await controlDevice(backendDeviceId, action)

      // Step 11: HTTP 200 received — control completed
      clearTimeout(timeoutRefs.current[deviceKey])

      // Step 10→12: update UI to final state
      patchDevice(deviceKey, { status: enabled ? 'on' : 'off' })
      pushToast('success', `${deviceKey === 'light' ? 'Đèn' : deviceKey === 'fan' ? 'Quạt' : 'Smart TV'} đã ${enabled ? 'bật' : 'tắt'}`)

    } catch (err) {
      // Network / API error path
      clearTimeout(timeoutRefs.current[deviceKey])
      patchDevice(deviceKey, { status: enabled ? 'off' : 'on' }) // revert
      pushToast('error', `Lỗi điều khiển: ${err.message}`)
    }
  }, [patchDevice, pushToast])

  // cleanup all timeouts on unmount
  useEffect(() => {
    const refs = timeoutRefs.current
    return () => Object.values(refs).forEach(clearTimeout)
  }, [])

  // ── 4. Clock ─────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setClock(formatClock(new Date()))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // ── 5. Return — dùng liveMetrics/liveHistory thay vì snapshot ────
  return useMemo(
    () => ({
      loading,
      classrooms,
      metrics: liveMetrics,
      devices,
      history: liveHistory,
      clock,
      connected,
      onToggleDevice,
      toasts,
    }),
    [classrooms, clock, connected, devices, liveHistory, liveMetrics, loading, onToggleDevice, toasts],
  )
}

