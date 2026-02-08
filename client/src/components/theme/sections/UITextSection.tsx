import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Props {
  form: any;
  setForm: (f: any) => void;
}

const inputCls = 'w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-brand-500';

const TEXT_GROUPS: { group: string; fields: { key: string; label: string; default: string }[] }[] = [
  {
    group: 'Panels',
    fields: [
      { key: 'shopTitle', label: 'Shop Title', default: 'Shop' },
      { key: 'handTitle', label: 'Hand Title', default: 'Hand' },
      { key: 'boardTitle', label: 'Board Title', default: 'Board' },
    ],
  },
  {
    group: 'Labels',
    fields: [
      { key: 'coinsLabel', label: 'Coins Label', default: 'Coins' },
      { key: 'healthLabel', label: 'Health Label', default: 'Health' },
      { key: 'tierLabel', label: 'Tier Label', default: 'Tier' },
    ],
  },
  {
    group: 'Buttons',
    fields: [
      { key: 'buyButton', label: 'Buy Button', default: 'Buy' },
      { key: 'sellButton', label: 'Sell Button', default: 'Sell' },
      { key: 'playButton', label: 'Play Button', default: 'Play' },
      { key: 'rerollButton', label: 'Reroll Button', default: 'Reroll' },
      { key: 'upgradeButton', label: 'Upgrade Button', default: 'Upgrade' },
      { key: 'maxTierText', label: 'Max Tier Text', default: 'MAX' },
      { key: 'freezeButton', label: 'Freeze Button', default: 'Freeze' },
      { key: 'unfreezeButton', label: 'Unfreeze Button', default: 'Unfreeze' },
      { key: 'endTurnButton', label: 'End Turn Button', default: 'End Turn' },
    ],
  },
  {
    group: 'Combat',
    fields: [
      { key: 'combatPhaseTitle', label: 'Combat Phase Title', default: 'Combat Phase' },
      { key: 'recruitPhaseTitle', label: 'Recruit Phase Title', default: 'Recruit Phase' },
      { key: 'victoryText', label: 'Victory Text', default: 'Victory!' },
      { key: 'defeatText', label: 'Defeat Text', default: 'Defeat!' },
      { key: 'tieText', label: 'Tie Text', default: 'Tie!' },
    ],
  },
  {
    group: 'Game Over',
    fields: [
      { key: 'gameOverTitle', label: 'Game Over Title', default: 'Game Over' },
      { key: 'playAgainText', label: 'Play Again Text', default: 'Play Again' },
      { key: 'quitToMenuText', label: 'Quit to Menu Text', default: 'Quit to Menu' },
    ],
  },
];

export default function UITextSection({ form, setForm }: Props) {
  const [open, setOpen] = useState(true);

  const uiText = form.uiText || {};
  const setText = (key: string, value: string) => {
    setForm({ ...form, uiText: { ...uiText, [key]: value } });
  };

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-4 text-left font-semibold hover:bg-gray-800/50 rounded-t-xl transition-colors">
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        UI Text
        <span className="text-xs text-gray-500 font-normal ml-auto">23 fields</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4">
          {TEXT_GROUPS.map(group => (
            <div key={group.group}>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">{group.group}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {group.fields.map(field => (
                  <div key={field.key}>
                    <label className="text-xs text-gray-500">{field.label}</label>
                    <input
                      value={uiText[field.key] ?? ''}
                      onChange={e => setText(field.key, e.target.value)}
                      placeholder={field.default}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
