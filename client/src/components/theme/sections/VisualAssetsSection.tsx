import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import ImageUploadField from '../../common/ImageUploadField';

interface Props {
  form: any;
  setForm: (f: any) => void;
}

const ASSET_GROUPS: { group: string; fields: { key: string; label: string }[] }[] = [
  {
    group: 'Background',
    fields: [
      { key: 'gameBackground', label: 'Game Background' },
    ],
  },
  {
    group: 'Card Frames',
    fields: [
      { key: 'cardFrameCommon', label: 'Common Frame (Tier 1-2)' },
      { key: 'cardFrameRare', label: 'Rare Frame (Tier 3-4)' },
      { key: 'cardFrameEpic', label: 'Epic Frame (Tier 5-6)' },
      { key: 'cardBack', label: 'Card Back' },
    ],
  },
  {
    group: 'UI Panels',
    fields: [
      { key: 'panelBackground', label: 'Panel Background' },
      { key: 'buttonNormal', label: 'Button Normal' },
      { key: 'buttonHighlighted', label: 'Button Highlighted' },
      { key: 'buttonPressed', label: 'Button Pressed' },
      { key: 'buttonDisabled', label: 'Button Disabled' },
    ],
  },
  {
    group: 'Icons',
    fields: [
      { key: 'coinIcon', label: 'Coin Icon' },
      { key: 'healthIcon', label: 'Health Icon' },
      { key: 'attackIcon', label: 'Attack Icon' },
      { key: 'shieldIcon', label: 'Shield Icon' },
    ],
  },
];

export default function VisualAssetsSection({ form, setForm }: Props) {
  const [open, setOpen] = useState(true);

  const assets = form.assets || {};
  const setAsset = (key: string, value: string) => {
    setForm({ ...form, assets: { ...assets, [key]: value } });
  };

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-4 text-left font-semibold hover:bg-gray-800/50 rounded-t-xl transition-colors">
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        Visual Assets
        <span className="text-xs text-gray-500 font-normal ml-auto">14 sprites</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4">
          {ASSET_GROUPS.map(group => (
            <div key={group.group}>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">{group.group}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {group.fields.map(field => (
                  <ImageUploadField
                    key={field.key}
                    value={assets[field.key] || ''}
                    onChange={url => setAsset(field.key, url)}
                    label={field.label}
                    folder="theme-assets"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
