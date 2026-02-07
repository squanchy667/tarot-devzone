import { useAuth } from '../../hooks/useAuth';
import { LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">{user?.email}</span>
        <button onClick={logout} className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-800 transition-colors" title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
