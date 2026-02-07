import { useSynergies, useUpdateSynergy } from '../../hooks/useSynergies';
import { useState } from 'react';
import { Save, ChevronDown, ChevronRight } from 'lucide-react';

const TRIGGERS = ['Passive', 'StartOfCombat', 'EndOfCombat', 'OnSell', 'OnBuy', 'OnDeath', 'EndOfTurn'];
const EFFECTS = ['BuffAttack', 'BuffHealth', 'BuffStats', 'BonusGold', 'ReduceCost', 'BonusDamage', 'Piercing', 'Cleave', 'HealFlat', 'HealPercent', 'Shield', 'ExtraCardDraw', 'Discover'];
const TARGETS = ['AllTribeMembers', 'AllFriendly', 'Adjacent', 'Random', 'Self'];

export default function SynergyEditor() {
  const { data: synergies, isLoading } = useSynergies();
  const updateSynergy = useUpdateSynergy();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  const startEdit = (s: any) => { setExpanded(s.tribeType); setEditData(JSON.parse(JSON.stringify(s))); };
  const handleSave = async () => {
    if (!editData) return;
    await updateSynergy.mutateAsync({ tribe: editData.tribeType, synergy: editData });
    setEditData(null);
  };

  if (isLoading) return <div className="text-gray-400">Loading synergies...</div>;

  const selectCls = 'w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white';

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-2xl font-bold">Synergy Editor</h2>
      {(synergies || []).map((s: any) => (
        <div key={s.tribeType} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <button onClick={() => expanded === s.tribeType ? setExpanded(null) : startEdit(s)}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-800/50 transition-colors">
            {expanded === s.tribeType ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="font-semibold">{s.tribeName || s.tribeType}</span>
            <span className="text-sm text-gray-500">{s.tiers?.length || 0} tiers</span>
          </button>
          {expanded === s.tribeType && editData && (
            <div className="p-4 border-t border-gray-800 space-y-4">
              {editData.tiers?.map((tier: any, i: number) => (
                <div key={i} className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium text-gray-300">Tier {i + 1}</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div><label className="text-xs text-gray-500">Threshold</label>
                      <input type="number" value={tier.threshold} onChange={e => { const t = [...editData.tiers]; t[i] = { ...tier, threshold: Number(e.target.value) }; setEditData({ ...editData, tiers: t }); }} className={selectCls} /></div>
                    <div><label className="text-xs text-gray-500">Trigger</label>
                      <select value={tier.trigger} onChange={e => { const t = [...editData.tiers]; t[i] = { ...tier, trigger: e.target.value }; setEditData({ ...editData, tiers: t }); }} className={selectCls}>
                        {TRIGGERS.map(t => <option key={t}>{t}</option>)}</select></div>
                    <div><label className="text-xs text-gray-500">Effect</label>
                      <select value={tier.effect} onChange={e => { const t = [...editData.tiers]; t[i] = { ...tier, effect: e.target.value }; setEditData({ ...editData, tiers: t }); }} className={selectCls}>
                        {EFFECTS.map(ef => <option key={ef}>{ef}</option>)}</select></div>
                    <div><label className="text-xs text-gray-500">Value</label>
                      <input type="number" value={tier.value} onChange={e => { const t = [...editData.tiers]; t[i] = { ...tier, value: Number(e.target.value) }; setEditData({ ...editData, tiers: t }); }} className={selectCls} /></div>
                  </div>
                  <div><label className="text-xs text-gray-500">Target</label>
                    <select value={tier.target} onChange={e => { const t = [...editData.tiers]; t[i] = { ...tier, target: e.target.value }; setEditData({ ...editData, tiers: t }); }} className={selectCls}>
                      {TARGETS.map(t => <option key={t}>{t}</option>)}</select></div>
                </div>
              ))}
              <button onClick={handleSave} disabled={updateSynergy.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                <Save size={14} /> {updateSynergy.isPending ? 'Saving...' : 'Save Synergy'}
              </button>
            </div>
          )}
        </div>
      ))}
      {(!synergies || synergies.length === 0) && <p className="text-gray-500">No synergies loaded. Deploy initial game data first.</p>}
    </div>
  );
}
