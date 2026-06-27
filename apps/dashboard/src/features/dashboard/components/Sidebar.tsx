interface NavItem {
  id: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',    label: 'Overview',    icon: '▦' },
  { id: 'funnel',      label: 'Funnel',      icon: '↓' },
  { id: 'conversions', label: 'Conversions', icon: '%' },
  { id: 'sources',     label: 'Sources',     icon: '◉' },
  { id: 'trends',      label: 'Trends',      icon: '↗' },
  { id: 'timing',      label: 'Timing',      icon: '⏱' },
  { id: 'attribution', label: 'Attribution', icon: '☰' },
]

interface SidebarProps {
  active: string
  onSelect: (id: string) => void
  onRefresh: () => void
  onLogout: () => void
}

const Sidebar = ({ active, onSelect, onRefresh, onLogout }: SidebarProps) => (
  <div className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
    <div className="px-5 py-6 border-b border-gray-100">
      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-0.5">Analytics</p>
      <h1 className="text-base font-bold text-gray-900 leading-tight">Marketing Funnel</h1>
    </div>

    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {NAV_ITEMS.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            active === id
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
          }`}
        >
          <span className="text-base w-5 text-center">{icon}</span>
          {label}
        </button>
      ))}
    </nav>

    <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
      <button
        onClick={onRefresh}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
      >
        <span className="text-base w-5 text-center">↻</span>
        Refresh
      </button>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <span className="text-base w-5 text-center">→</span>
        Logout
      </button>
    </div>
  </div>
)

export default Sidebar
