import { useCallback, useEffect, useMemo, useState } from 'react'
import { getClassrooms, getDashboardSnapshot, toggleDevice } from '../api/dashboardApi'
import { useRealtimeSensor } from './useRealtimeSensor'
import { formatClock } from '../utils/formatters'

export function useDashboardData(classroomId) {
  const [loading, setLoading] = useState(true)
  const [classrooms, setClassrooms] = useState([])
  const [snapshotMetrics, setSnapshotMetrics] = useState(null)
  const [snapshotHistory, setSnapshotHistory] = useState(null)
  const [devices, setDevices] = useState([])
  const [clock, setClock] = useState(formatClock(new Date()))

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

  // ── 3. Toggle device ──────────────────────────────────────────────
  const onToggleDevice = useCallback(async (id, enabled) => {
    const nextStatus = enabled ? 'on' : 'off'
    const updated = await toggleDevice(id, nextStatus)

    setDevices((prev) =>
      prev.map((device) =>
        device.id === id ? { ...device, status: updated.status } : device,
      ),
    )
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
      metrics: liveMetrics,       // ← realtime, fallback sang snapshot khi socket chưa có data
      devices,
      history: liveHistory,       // ← rolling buffer
      clock,
      connected,                  // ← trạng thái kết nối socket (dùng để hiển thị badge)
      onToggleDevice,
    }),
    [classrooms, clock, connected, devices, liveHistory, liveMetrics, loading, onToggleDevice],
  )
}
