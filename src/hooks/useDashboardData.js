import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getClassrooms, getDashboardSnapshot } from '../api/dashboardApi'
import { controlDevice } from '../api/actionApi'
import { useRealtimeSensor } from './useRealtimeSensor'
import { formatClock } from '../utils/formatters'
import socket from '../socket/socketClient'

// deviceId map: dashboard devices index → backend deviceId
const DEVICE_ID_MAP = {
  light: 1, // deviceId=1 → Main Light
  fan:   2, // deviceId=2 → Ceiling Fan
  tv:    3, // deviceId=3 → Smart TV
}

const DEVICE_KEY_BY_BACKEND_ID = {
  1: 'light',
  2: 'fan',
  3: 'tv',
}

const CONTROL_TIMEOUT_MS = 10_000
const SOCKET_DEVICE_TOPIC = import.meta.env.VITE_SOCKET_DEVICE_TOPIC || 'device-status'

function normalizeDeviceStatus(status) {
  const value = String(status || '').toUpperCase()
  if (value === 'ON') return 'on'
  if (value === 'OFF') return 'off'
  return null
}

export function useDashboardData(classroomId) {
  const [loading, setLoading]               = useState(true)
  const [classrooms, setClassrooms]         = useState([])
  const [snapshotMetrics, setSnapshotMetrics] = useState(null)
  const [snapshotHistory, setSnapshotHistory] = useState(null)
  const [devices, setDevices]               = useState([])
  const [clock, setClock]                   = useState(formatClock(new Date()))
  const [toasts, setToasts]                 = useState([])   // { id, type, message }

  const timeoutRefs = useRef({})  // deviceId → timeout handle
  const pendingControlRef = useRef({ byDeviceKey: {}, byActionId: {} })

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

  const clearPendingControl = useCallback((deviceKey, actionId) => {
    const pending = pendingControlRef.current
    const pendingByDevice = pending.byDeviceKey[deviceKey]

    if (actionId != null) {
      delete pending.byActionId[String(actionId)]
    }

    if (pendingByDevice?.actionId != null) {
      delete pending.byActionId[String(pendingByDevice.actionId)]
    }

    delete pending.byDeviceKey[deviceKey]
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

  // ── 3. Listen device status from backend socket ─────────────────
  useEffect(() => {
    function onDeviceStatus(payload) {
      const data = payload && typeof payload === 'object' ? payload : {}
      const actionId = data.actionId != null ? String(data.actionId) : null
      const backendDeviceId = Number(data.deviceId)
      const status = data.status

      const deviceKeyFromPayload = DEVICE_KEY_BY_BACKEND_ID[backendDeviceId]
      const pending =
        (actionId ? pendingControlRef.current.byActionId[actionId] : null) ||
        (deviceKeyFromPayload ? pendingControlRef.current.byDeviceKey[deviceKeyFromPayload] : null)

      if (!pending) return

      const deviceKey = pending.deviceKey
      const resolvedStatus = normalizeDeviceStatus(status)

      clearTimeout(timeoutRefs.current[deviceKey])
      delete timeoutRefs.current[deviceKey]
      clearPendingControl(deviceKey, actionId)

      if (resolvedStatus) {
        patchDevice(deviceKey, { status: resolvedStatus })
        pushToast('success', `${pending.label} đã ${resolvedStatus === 'on' ? 'bật' : 'tắt'}`)
        return
      }

      patchDevice(deviceKey, { status: pending.previousStatus })
      pushToast('error', `${pending.label} ${String(status || 'FAILED').toUpperCase()}`)
    }

    socket.on(SOCKET_DEVICE_TOPIC, onDeviceStatus)
    return () => {
      socket.off(SOCKET_DEVICE_TOPIC, onDeviceStatus)
    }
  }, [clearPendingControl, patchDevice, pushToast])

  // ── 4. Toggle device — wait for socket confirmation ──────────────
  const onToggleDevice = useCallback(async (deviceKey, enabled) => {
    const backendDeviceId = DEVICE_ID_MAP[deviceKey]
    if (!backendDeviceId) return

    const previousStatus = devices.find((item) => item.id === deviceKey)?.status === 'on' ? 'on' : 'off'
    const desiredStatus = enabled ? 'on' : 'off'
    const action = enabled ? 'ON' : 'OFF'
    const label = deviceKey === 'light' ? 'Đèn' : deviceKey === 'fan' ? 'Quạt' : 'Smart TV'

    // Cancel previous pending request for this device (if any)
    clearPendingControl(deviceKey)

    // User tapped: set loading and wait for backend socket response
    patchDevice(deviceKey, { status: 'loading' })
    pendingControlRef.current.byDeviceKey[deviceKey] = {
      deviceKey,
      previousStatus,
      desiredStatus,
      actionId: null,
      label,
    }

    // Timeout path if socket confirmation does not arrive
    if (timeoutRefs.current[deviceKey]) {
      clearTimeout(timeoutRefs.current[deviceKey])
    }
    const timeoutHandle = setTimeout(() => {
      const pending = pendingControlRef.current.byDeviceKey[deviceKey]
      const revertStatus = pending?.previousStatus || previousStatus
      clearPendingControl(deviceKey)
      delete timeoutRefs.current[deviceKey]
      patchDevice(deviceKey, { status: revertStatus })
      pushToast('error', `Thiết bị không phản hồi`)
    }, CONTROL_TIMEOUT_MS)
    timeoutRefs.current[deviceKey] = timeoutHandle

    try {
      // API returns LOADING action; final state must come from socket event
      const controlResult = await controlDevice(backendDeviceId, action)
      const actionId = controlResult?.actionId ?? controlResult?.id

      if (actionId != null && pendingControlRef.current.byDeviceKey[deviceKey]) {
        const actionIdKey = String(actionId)
        pendingControlRef.current.byDeviceKey[deviceKey] = {
          ...pendingControlRef.current.byDeviceKey[deviceKey],
          actionId: actionIdKey,
        }
        pendingControlRef.current.byActionId[actionIdKey] = {
          ...pendingControlRef.current.byDeviceKey[deviceKey],
        }
      }

    } catch (err) {
      // Network / API error path
      clearTimeout(timeoutRefs.current[deviceKey])
      delete timeoutRefs.current[deviceKey]
      clearPendingControl(deviceKey)
      patchDevice(deviceKey, { status: previousStatus })
      pushToast('error', `Lỗi điều khiển: ${err.message}`)
    }
  }, [clearPendingControl, devices, patchDevice, pushToast])

  // cleanup all timeouts on unmount
  useEffect(() => {
    const refs = timeoutRefs.current
    return () => Object.values(refs).forEach(clearTimeout)
  }, [])

  // ── 5. Clock ─────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setClock(formatClock(new Date()))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // ── 6. Return — dùng liveMetrics/liveHistory thay vì snapshot ────
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

