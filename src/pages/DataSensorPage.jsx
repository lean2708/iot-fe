import TopBar from '../components/TopBar'
import { useAppContext } from '../contexts/AppContext'
import { useDashboardData } from '../hooks/useDashboardData'
import { formatDateTime } from '../utils/formatters'

function DataSensorPage() {
  const { classroomId } = useAppContext()
  const { classrooms, metrics } = useDashboardData(classroomId)

  const rows = [
    { name: 'Temperature', value: `${metrics?.temperature.value ?? '--'} °C` },
    { name: 'Light', value: `${metrics?.light.value ?? '--'} Lux` },
    {
      name: 'LED Time',
      value: `${Math.floor((metrics?.ledUsage.value ?? 0) / 60)}h ${(metrics?.ledUsage.value ?? 0) % 60}m`,
    },
  ]

  return (
    <>
      <TopBar title="Data Sensor" classrooms={classrooms} clock={new Date().toLocaleTimeString()} />

      <section className="simple-page">
        <h2>Sensor Snapshot</h2>
        <p>Dữ liệu tức thời từ các cảm biến trong phòng học.</p>

        <table className="sensor-table">
          <thead>
            <tr>
              <th>Sensor</th>
              <th>Value</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.value}</td>
                <td>{formatDateTime(new Date())}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

export default DataSensorPage
