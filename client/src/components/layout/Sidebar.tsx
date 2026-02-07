import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Zap, SlidersHorizontal, Palette, GitBranch, Rocket } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/cards', icon: CreditCard, label: 'Cards' },
  { to: '/synergies', icon: Zap, label: 'Synergies' },
  { to: '/balance', icon: SlidersHorizontal, label: 'Balance' },
  { to: '/theme', icon: Palette, label: 'Theme' },
  { to: '/versions', icon: GitBranch, label: 'Versions' },
  { to: '/deploy', icon: Rocket, label: 'Deploy' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-brand-400">Tarot DevZone</h1>
        <p className="text-xs text-gray-500">Game Editor</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-brand-600/20 text-brand-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
