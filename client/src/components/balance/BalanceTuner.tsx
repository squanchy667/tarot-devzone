import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';

const DEFAULTS: any = {
  tierCopies: { 1: 16, 2: 15, 3: 13, 4: 11, 5: 9, 6: 7 },
  shopSizes: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5, 6: 6 },
  baseBuyCost: 3, goldenMultiplier: 2, recruitTimerSeconds: 35,
  startingGold: 3, goldPerTurnBase: 1, maxGold: 10,
  tavernUpgradeCosts: { 2: 5, 3: 8, 4: 11, 5: 11, 6: 11 },
  startingHealth: 40, maxBoardSize: 7, maxHandSize: 10,
};

export default function BalanceTuner() {
  const qc = useQueryClient();
  const { data: config, isLoading } = useQuery({ queryKey: ['config'], queryFn: () => api.getConfig() });
  const save = useMutation({ mutationFn: (c: any) => api.updateConfig(c), onSuccess: () => qc.invalidateQueries({ queryKey: ['config'] }) });
  const [form, setForm] = useState<any>(DEFAULTS);

  useEffect(() => { if (config) setForm(config); }, [config]);

  const set = (key: string, val: any) => setForm((f: any) => ({ ...f, [key]: val }));
  const setNested = (key: string, sub: string, val: number) => setForm((f: any) => ({ ...f, [key]: { ...f[key], [sub]: val } }));

  if (isLoading) return <div className="text-gray-400">Loading config...</div>;

  const inputCls = 'w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Balance Tuner</h2>
        <div className="flex gap-2">
          <button onClick={() => setForm(DEFAULTS)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"><RotateCcw size={14} /> Reset</button>
          <button onClick={() => save.mutate(form)} disabled={save.isPending} className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 rounded text-sm font-medium transition-colors disabled:opacity-50"><Save size={14} /> {save.isPending ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
        <h3 className="font-semibold">Economy</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {([['Base Buy Cost','baseBuyCost',1,10],['Golden Multiplier','goldenMultiplier',1,5],['Starting Gold','startingGold',0,20],['Gold/Turn Base','goldPerTurnBase',0,10],['Max Gold','maxGold',1,30],['Starting Health','startingHealth',1,100],['Recruit Timer (s)','recruitTimerSeconds',10,120],['Max Board Size','maxBoardSize',1,10]] as const).map(([label,key,min,max]) => (
            <div key={key}><label className="text-xs text-gray-500">{label}</label>
              <input type="number" value={form[key] ?? 0} min={min} max={max} onChange={e => set(key, Number(e.target.value))} className={inputCls} /></div>
          ))}
        </div>
      </section>
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
        <h3 className="font-semibold">Pool Copies per Tier</h3>
        <div className="grid grid-cols-6 gap-3">
          {[1,2,3,4,5,6].map(t => (
            <div key={t}><label className="text-xs text-gray-500">Tier {t}</label>
              <input type="number" value={form.tierCopies?.[t] ?? 0} min={1} max={30} onChange={e => setNested('tierCopies', String(t), Number(e.target.value))} className={inputCls} /></div>
          ))}
        </div>
      </section>
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
        <h3 className="font-semibold">Shop Sizes per Tier</h3>
        <div className="grid grid-cols-6 gap-3">
          {[1,2,3,4,5,6].map(t => (
            <div key={t}><label className="text-xs text-gray-500">Tier {t}</label>
              <input type="number" value={form.shopSizes?.[t] ?? 0} min={1} max={10} onChange={e => setNested('shopSizes', String(t), Number(e.target.value))} className={inputCls} /></div>
          ))}
        </div>
      </section>
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
        <h3 className="font-semibold">Tavern Upgrade Costs</h3>
        <div className="grid grid-cols-5 gap-3">
          {[2,3,4,5,6].map(t => (
            <div key={t}><label className="text-xs text-gray-500">To Tier {t}</label>
              <input type="number" value={form.tavernUpgradeCosts?.[t] ?? 0} min={0} max={30} onChange={e => setNested('tavernUpgradeCosts', String(t), Number(e.target.value))} className={inputCls} /></div>
          ))}
        </div>
      </section>
    </div>
  );
}
