import { useCards } from '../../hooks/useCards';
import { useSynergies } from '../../hooks/useSynergies';
import { Link } from 'react-router-dom';
import { CreditCard, Zap, Rocket } from 'lucide-react';

export default function Dashboard() {
  const { data: cards } = useCards();
  const { data: synergies } = useSynergies();

  const tribeCount = (tribe: string) =>
    cards?.filter((c: any) => c.tribes?.includes(tribe)).length || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="text-brand-400" size={20} />
            <h3 className="font-semibold">Cards</h3>
          </div>
          <p className="text-3xl font-bold">{cards?.length || 0}</p>
          <div className="mt-2 text-sm text-gray-400 space-y-1">
            {['Pentacles', 'Cups', 'Swords', 'Wands'].map(t => (
              <div key={t} className="flex justify-between"><span>{t}</span><span>{tribeCount(t)}</span></div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="text-yellow-400" size={20} />
            <h3 className="font-semibold">Synergies</h3>
          </div>
          <p className="text-3xl font-bold">{synergies?.length || 0}</p>
          <p className="text-sm text-gray-400 mt-2">Active tribe synergies</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <Rocket className="text-green-400" size={20} />
            <h3 className="font-semibold">Quick Actions</h3>
          </div>
          <div className="space-y-2 mt-2">
            <Link to="/cards" className="block w-full text-left px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm transition-colors">Edit Cards</Link>
            <Link to="/deploy" className="block w-full text-left px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm transition-colors">Deploy to Live</Link>
            <Link to="/versions" className="block w-full text-left px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm transition-colors">Create Version</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
