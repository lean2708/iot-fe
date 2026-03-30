import ChartCard from '../components/ChartCard'
import DeviceCard from '../components/DeviceCard'
import MetricCard from '../components/MetricCard'
import TopBar from '../components/TopBar'
import { useAppContext } from '../contexts/AppContext'
import { useDashboardData } from '../hooks/useDashboardData'
import { formatDuration } from '../utils/formatters'

function DashboardPage() {
  const { classroomId } = useAppContext()
  const { loading, metrics, devices, history, onToggleDevice } = useDashboardData(classroomId)

  if (loading || !metrics || !history) {
    return <section className="simple-page">Loading dashboard data...</section>
  }

  const deviceModel = [
    { ...devices[0], icon: 'lightbulb' },
    { ...devices[1], icon: 'mode_fan' },
    { ...devices[2], icon: 'tv' },
    { id: 'all-off' },
  ]

  return (
    <>
      <TopBar title="Dashboard" />

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
          icon="wb_incandescent"
          label="LED Usage Time"
          value={formatDuration(metrics.ledUsage.value)}
          unit=""
          delta={metrics.ledUsage.delta}
          note={metrics.ledUsage.note}
          tone="violet"
        />
      </section>

      <section className="charts-grid">
        <ChartCard
          title="Temperature"
          subtitle="Last 24 Hours"
          pill="Avg 24°C"
          pillStyle={{ color: '#137fec', background: 'rgba(19, 127, 236, 0.12)' }}
          data={history.temperature}
          axis={['08:00', '16:00', '00:00']}
          stroke="#137fec"
          gradientId="tempGrad"
        />
        <ChartCard
          title="Light Intensity"
          subtitle="Real-time usage"
          pill="Avg 480 Lux"
          pillStyle={{ color: '#ca8a04', background: 'rgba(234, 179, 8, 0.16)' }}
          data={history.light}
          axis={['08:00', '16:00', '00:00']}
          stroke="#f59e0b"
          gradientId="lightGrad"
        />
        <ChartCard
          title="LED Usage History"
          subtitle="Hours per day"
          pill="Weekly Avg 5.2h"
          pillStyle={{ color: '#9333ea', background: 'rgba(168, 85, 247, 0.16)' }}
          data={history.led}
          axis={['Mon', 'Wed', 'Sun']}
          stroke="#a855f7"
          gradientId="ledGrad"
        />
      </section>

      <section className="devices-section">
        <div className="devices-grid">
          {deviceModel.map((device) => (
            <DeviceCard key={device.id} device={device} onToggle={onToggleDevice} />
          ))}
        </div>
      </section>
    </>
  )
}

export default DashboardPage
