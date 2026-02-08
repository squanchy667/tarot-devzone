import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import ImageUploadField from '../common/ImageUploadField';

const TRIBES = ['Pentacles', 'Cups', 'Swords', 'Wands'];
const TRIGGERS = ['None', 'Battlecry', 'Deathrattle', 'OnAttack', 'OnDamaged', 'StartOfCombat', 'EndOfTurn'];
const EFFECTS = [
  'None', 'BuffAdjacentAttack', 'BuffAdjacentHealth', 'BuffAdjacentStats',
  'BuffAllFriendlyAttack', 'BuffOtherFriendlyAttack', 'GainAegis', 'GainCoins',
  'DeathrattleBuffRandomFriendly', 'DeathrattleDamageRandomEnemy', 'DeathrattleDamageAllEnemies',
  'OnAttackBuffSelf', 'OnAttackBonusDamage', 'OnAttackCleave', 'Taunt',
];
const EFFECT_TYPES = ['NoEffect', 'Summoning', 'LastReading', 'Guardian', 'Aegis', 'Echo'];

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface Props {
  card: any | null;
  onSave: (card: any) => Promise<void>;
  saving: boolean;
}

export default function CardForm({ card, onSave, saving }: Props) {
  const blank = {
    id: '', cardName: '', tier: 1, attack: 1, health: 1, tribes: ['Pentacles'] as string[],
    imageUrl: '', ability: '', abilityTrigger: 'None', abilityEffect: 'None', abilityValue: 0,
    effectType: 'NoEffect', buyCostModifier: 0, sellValueModifier: 0,
  };
  const [form, setForm] = useState(blank);

  useEffect(() => { setForm(card ? { ...card } : blank); }, [card]);

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ ...form, id: form.id || toSlug(form.cardName) });
  };

  const inputCls = 'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-brand-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Card Name</label>
          <input value={form.cardName} onChange={e => set('cardName', e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">ID</label>
          <input value={form.id || toSlug(form.cardName)} readOnly className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded text-sm text-gray-500" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Tier</label>
          <select value={form.tier} onChange={e => set('tier', Number(e.target.value))} className={inputCls}>
            {[1,2,3,4,5,6].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Attack</label>
          <input type="number" value={form.attack} onChange={e => set('attack', Number(e.target.value))} min={0} max={99} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Health</label>
          <input type="number" value={form.health} onChange={e => set('health', Number(e.target.value))} min={1} max={99} className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Tribes</label>
        <div className="flex gap-3 flex-wrap">
          {TRIBES.map(t => (
            <label key={t} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={form.tribes?.includes(t)}
                onChange={e => {
                  const tribes = e.target.checked ? [...(form.tribes || []), t] : (form.tribes || []).filter((x: string) => x !== t);
                  set('tribes', tribes.length ? tribes : ['None']);
                }} className="rounded border-gray-600" />
              {t}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Ability Description</label>
        <input value={form.ability} onChange={e => set('ability', e.target.value)} className={inputCls} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Trigger</label>
          <select value={form.abilityTrigger} onChange={e => set('abilityTrigger', e.target.value)} className={inputCls}>
            {TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Effect</label>
          <select value={form.abilityEffect} onChange={e => set('abilityEffect', e.target.value)} className={inputCls}>
            {EFFECTS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Value</label>
          <input type="number" value={form.abilityValue} onChange={e => set('abilityValue', Number(e.target.value))} min={0} max={99} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Effect Type (Legacy)</label>
          <select value={form.effectType} onChange={e => set('effectType', e.target.value)} className={inputCls}>
            {EFFECT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Buy Cost Mod</label>
          <input type="number" value={form.buyCostModifier} onChange={e => set('buyCostModifier', Number(e.target.value))} min={-5} max={5} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Sell Value Mod</label>
          <input type="number" value={form.sellValueModifier} onChange={e => set('sellValueModifier', Number(e.target.value))} min={-5} max={5} className={inputCls} />
        </div>
      </div>
      <ImageUploadField value={form.imageUrl} onChange={url => set('imageUrl', url)} label="Card Image" folder="images" />
      <button type="submit" disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg font-medium transition-colors disabled:opacity-50">
        <Save size={16} /> {saving ? 'Saving...' : 'Save Card'}
      </button>
    </form>
  );
}
