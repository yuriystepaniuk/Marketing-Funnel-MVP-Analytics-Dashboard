interface DashboardHeaderProps {
  onRefresh: () => void
  onLogout: () => void
}

const DashboardHeader = ({ onRefresh, onLogout }: DashboardHeaderProps) => (
  <div className="flex items-center justify-between gap-4">
    <h1 className="text-base sm:text-2xl font-bold text-gray-900 whitespace-nowrap">Marketing Funnel Analytics</h1>
    <div className="flex gap-2 shrink-0">
      <button
        onClick={onRefresh}
        className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
      >
        ↻ <span className="hidden sm:inline">Refresh</span>
      </button>
      <button
        onClick={onLogout}
        className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg transition-colors font-medium"
      >
        <span className="hidden sm:inline">Logout</span><span className="sm:hidden">Exit</span>
      </button>
    </div>
  </div>
)

export default DashboardHeader
