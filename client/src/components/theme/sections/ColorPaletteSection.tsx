import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface Props {
  form: any;
  setForm: (f: any) => void;
}

const COLOR_FIELDS: { key: string; label: string; group: string }[] = [
  { key: 'primary', label: 'Primary', group: 'Core' },
  { key: 'secondary', label: 'Secondary', group: 'Core' },
  { key: 'accent', label: 'Accent', group: 'Core' },
  { key: 'positive', label: 'Positive', group: 'Feedback' },
  { key: 'negative', label: 'Negative', group: 'Feedback' },
  { key: 'textColorLight', label: 'Text Light', group: 'Text' },
  { key: 'textColorDark', label: 'Text Dark', group: 'Text' },
  { key: 'gameBackgroundColor', label: 'Game Background', group: 'Background' },
  { key: 'cardBackgroundColor', label: 'Card Background', group: 'Card' },
  { key: 'goldenCardColor', label: 'Golden Card', group: 'Card' },
];

export default function ColorPaletteSection({ form, setForm }: Props) {
  const [open, setOpen] = useState(true);
  const [activePicker, setActivePicker] = useState<string | null>(null);

  const colors = form.colors || {};
  const setColor = (key: string, value: string) => {
    setForm({ ...form, colors: { ...colors, [key]: value } });
  };

  const groups = Array.from(new Set(COLOR_FIELDS.map(f => f.group)));

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-4 text-left font-semibold hover:bg-gray-800/50 rounded-t-xl transition-colors">
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        Color Palette
        <span className="text-xs text-gray-500 font-normal ml-auto">10 colors</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4">
          {groups.map(group => (
            <div key={group}>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">{group}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COLOR_FIELDS.filter(f => f.group === group).map(field => {
                  const val = colors[field.key] || '';
                  return (
                    <div key={field.key}>
                      <label className="text-xs text-gray-500">{field.label}</label>
                      <div className="flex gap-2 items-center mt-0.5">
                        <button type="button"
                          className="w-7 h-7 rounded border border-gray-600 flex-shrink-0"
                          style={{ backgroundColor: val || '#000' }}
                          onClick={() => setActivePicker(activePicker === field.key ? null : field.key)} />
                        <input value={val}
                          onChange={e => setColor(field.key, e.target.value)}
                          placeholder="#000000"
                          className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-brand-500" />
                      </div>
                      {activePicker === field.key && (
                        <div className="mt-2"><HexColorPicker color={val || '#000000'} onChange={c => setColor(field.key, c)} /></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
