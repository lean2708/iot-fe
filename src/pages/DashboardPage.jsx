import ChartCard from '../components/ChartCard'
import DeviceCard from '../components/DeviceCard'
import MetricCard from '../components/MetricCard'
import TopBar from '../components/TopBar'
import { useAppContext } from '../contexts/AppContext'
import { useDashboardData } from '../hooks/useDashboardData'
import { formatDuration } from '../utils/formatters'

const AXIS_24H = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']

function DashboardPage() {
  const { classroomId } = useAppContext()
  const { loading, metrics, devices, history, onToggleDevice, connected, toasts } = useDashboardData(classroomId)

  if (loading || !metrics || !history) {
    return <section className="simple-page">Loading dashboard data...</section>
  }

  // Map device array by position → use string keys matching DEVICE_ID_MAP
  const deviceModel = [
    { ...(devices[0] || {}), id: 'light', icon: 'lightbulb' },
    { ...(devices[1] || {}), id: 'fan',   icon: 'mode_fan'  },
    { ...(devices[2] || {}), id: 'tv',    icon: 'tv'        },
  ]

  return (
    <>
      <TopBar title="Dashboard">
        <span className={`rt-badge ${connected ? 'rt-badge--live' : 'rt-badge--off'}`}>
          <span className="rt-dot" />
          {connected ? 'Live' : 'Reconnecting...'}
        </span>
      </TopBar>

      <section className="metrics-grid">
        <MetricCard
          icon="thermostat"
          label="Temperature"
          value={metrics.temperature.value}
          unit="°C"
          delta={metrics.temperature.delta}
          note={metrics.temperature.note}
          tone="blue"
        />
        <MetricCard
          icon="light_mode"
          label="Light Intensity"
          value={metrics.light.value}
          unit="Lux"
          delta={metrics.light.delta}
          note={metrics.light.note}
          tone="yellow"
        />
        <MetricCard
          icon="humidity_high"
          label="Humidity"
          value={metrics.humidity.value}
          unit="%"
          delta={metrics.humidity.delta}
          note={metrics.humidity.note}
          tone="cyan"
        />
      </section>

      <section className="charts-grid">
        <ChartCard
          title="Temperature"
          pill={`Avg ${metrics.temperature.value}°C`}
          pillStyle={{ color: '#137fec', background: 'rgba(19, 127, 236, 0.12)' }}
          data={history.temperature}
          axis={AXIS_24H}
          stroke="#137fec"
          gradientId="tempGrad"
          unit="°C"
        />
        <ChartCard
          title="Light Intensity"
          pill={`Avg ${metrics.light.value} Lux`}
          pillStyle={{ color: '#ca8a04', background: 'rgba(234, 179, 8, 0.16)' }}
          data={history.light}
          axis={AXIS_24H}
          stroke="#f59e0b"
          gradientId="lightGrad"
          unit="Lux"
        />
        <ChartCard
          title="Humidity"
          pill={`Avg ${metrics.humidity.value}%`}
          pillStyle={{ color: '#0e7490', background: 'rgba(6, 182, 212, 0.2)' }}
          data={history.humidity}
          axis={AXIS_24H}
          stroke="#06b6d4"
          gradientId="humidityGrad"
          unit="%"
        />
      </section>

      <section className="devices-section">
        <div className="devices-grid">
          {deviceModel.map((device) => (
            <DeviceCard key={device.id} device={device} onToggle={onToggleDevice} />
          ))}
        </div>
      </section>

      {/* ── Toast notifications ── */}
      {toasts.length > 0 && (
        <div className="device-toast-stack" aria-live="polite">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`device-toast device-toast--${toast.type}`}
            >
              <span className="material-symbols-outlined device-toast-icon">
                {toast.type === 'success' ? 'check_circle' : 'error'}
              </span>
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default DashboardPage
