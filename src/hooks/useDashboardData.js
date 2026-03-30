import { useCallback, useEffect, useMemo, useState } from 'react'
import { getClassrooms, getDashboardSnapshot, toggleDevice } from '../api/dashboardApi'
import { formatClock } from '../utils/formatters'

export function useDashboardData(classroomId) {
  const [loading, setLoading] = useState(true)
  const [classrooms, setClassrooms] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [devices, setDevices] = useState([])
  const [history, setHistory] = useState(null)
  const [clock, setClock] = useState(formatClock(new Date()))

  const refreshData = useCallback(async () => {
    setLoading(true)
    const [allClassrooms, snapshot] = await Promise.all([
      getClassrooms(),
      getDashboardSnapshot(classroomId),
    ])

    setClassrooms(allClassrooms)
    setMetrics(snapshot.metrics)
    setDevices(snapshot.devices)
    setHistory(snapshot.history)
    setLoading(false)
  }, [classroomId])

  const onToggleDevice = useCallback(async (id, enabled) => {
    const nextStatus = enabled ? 'on' : 'off'
    const updated = await toggleDevice(id, nextStatus)

    setDevices((prev) =>
      prev.map((device) =>
        device.id === id ? { ...device, status: updated.status } : device,
      ),
    )
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(formatClock(new Date()))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const model = useMemo(
    () => ({
      loading,
      classrooms,
      metrics,
      devices,
      history,
      clock,
      onToggleDevice,
    }),
    [classrooms, clock, devices, history, loading, metrics, onToggleDevice],
  )

  return model
}
