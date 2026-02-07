import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

const DEFAULT_THEME: any = {
  gameName: 'Tarot Battlegrounds',
  tribes: {
    Pentacles: { name: 'Pentacles', description: 'Earth/Economy - Gold bonuses', color: '#d4a017' },
    Cups: { name: 'Cups', description: 'Water/Healing - Restoration effects', color: '#4fc3f7' },
    Swords: { name: 'Swords', description: 'Air/Aggro - Damage bonuses', color: '#ef5350' },
    Wands: { name: 'Wands', description: 'Fire/Buffs - Stat increases', color: '#ff9800' },
  },
  colors: { primary: '#7c3aed', secondary: '#1e1b4b', accent: '#f59e0b', positive: '#22c55e', negative: '#ef4444' },
  uiText: { shopTitle: 'Shop', handTitle: 'Hand', boardTitle: 'Board', buyButton: 'Buy', sellButton: 'Sell' },
};

export default function ThemeEditor() {
  const qc = useQueryClient();
  const { data: theme, isLoading } = useQuery({ queryKey: ['theme'], queryFn: () => api.getTheme() });
  const save = useMutation({ mutationFn: (t: any) => api.updateTheme(t), onSuccess: () => qc.invalidateQueries({ queryKey: ['theme'] }) });
  const [form, setForm] = useState<any>(DEFAULT_THEME);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  useEffect(() => { if (theme) setForm(theme); }, [theme]);

  if (isLoading) return <div className="text-gray-400">Loading theme...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Theme Editor</h2>
        <button onClick={() => save.mutate(form)} disabled={save.isPending}
          className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 rounded text-sm font-medium transition-colors disabled:opacity-50">
          <Save size={14} /> {save.isPending ? 'Saving...' : 'Save Theme'}
        </button>
      </div>
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
        <h3 className="font-semibold">Game Name</h3>
        <input value={form.gameName} onChange={e => setForm({ ...form, gameName: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white" />
      </section>
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
        <h3 className="font-semibold">Tribe Themes</h3>
        {Object.entries(form.tribes || {}).map(([key, t]: [string, any]) => (
          <div key={key} className="grid grid-cols-4 gap-3 items-end">
            <div><label className="text-xs text-gray-500">Name</label>
              <input value={t.name} onChange={e => setForm({ ...form, tribes: { ...form.tribes, [key]: { ...t, name: e.target.value } } })}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white" /></div>
            <div className="col-span-2"><label className="text-xs text-gray-500">Description</label>
              <input value={t.description} onChange={e => setForm({ ...form, tribes: { ...form.tribes, [key]: { ...t, description: e.target.value } } })}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white" /></div>
            <div><label className="text-xs text-gray-500">Color</label>
              <div className="flex gap-2 items-center">
                <button className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: t.color }}
                  onClick={() => setActiveColor(activeColor === key ? null : key)} />
                <input value={t.color} onChange={e => setForm({ ...form, tribes: { ...form.tribes, [key]: { ...t, color: e.target.value } } })}
                  className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
              </div>
              {activeColor === key && (
                <div className="mt-2"><HexColorPicker color={t.color}
                  onChange={c => setForm({ ...form, tribes: { ...form.tribes, [key]: { ...t, color: c } } })} /></div>
              )}
            </div>
          </div>
        ))}
      </section>
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
        <h3 className="font-semibold">UI Text</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(form.uiText || {}).map(([key, val]) => (
            <div key={key}><label className="text-xs text-gray-500">{key}</label>
              <input value={val as string} onChange={e => setForm({ ...form, uiText: { ...form.uiText, [key]: e.target.value } })}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white" /></div>
          ))}
        </div>
      </section>
    </div>
  );
}
