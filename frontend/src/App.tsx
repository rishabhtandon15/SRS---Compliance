import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { FlaskConical, FileSearch, History } from 'lucide-react'
import { clsx } from 'clsx'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'
import LegacyPage from './pages/LegacyPage'

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-indigo-600 text-white'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
        )
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
          <div className="px-6 py-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FlaskConical size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-100 leading-tight">SRS Compliance</h1>
                <p className="text-xs text-slate-500">Analyzer v2.0</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            <NavItem to="/" icon={FileSearch} label="V2 Analyze" />
            <NavItem to="/legacy" icon={History} label="Legacy Audit (R1–R4)" />
          </nav>
          <div className="px-4 py-4 border-t border-slate-800">
            <p className="text-xs text-slate-600">Hybrid BM25 + NLI Engine</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/legacy" element={<LegacyPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
