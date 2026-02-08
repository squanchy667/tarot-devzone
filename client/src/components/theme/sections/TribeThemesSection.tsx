import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import ImageUploadField from '../../common/ImageUploadField';

interface Props {
  form: any;
  setForm: (f: any) => void;
}

const inputCls = 'w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-brand-500';

export default function TribeThemesSection({ form, setForm }: Props) {
  const [open, setOpen] = useState(true);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const updateTribe = (key: string, field: string, value: any) => {
    setForm({ ...form, tribes: { ...form.tribes, [key]: { ...form.tribes[key], [field]: value } } });
  };

  const addAlias = (key: string) => {
    const tribe = form.tribes[key];
    const aliases = [...(tribe.aliases || []), ''];
    updateTribe(key, 'aliases', aliases);
  };

  const updateAlias = (key: string, index: number, value: string) => {
    const aliases = [...(form.tribes[key].aliases || [])];
    aliases[index] = value;
    updateTribe(key, 'aliases', aliases);
  };

  const removeAlias = (key: string, index: number) => {
    const aliases = (form.tribes[key].aliases || []).filter((_: any, i: number) => i !== index);
    updateTribe(key, 'aliases', aliases);
  };

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-4 text-left font-semibold hover:bg-gray-800/50 rounded-t-xl transition-colors">
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        Tribe Themes
        <span className="text-xs text-gray-500 font-normal ml-auto">{Object.keys(form.tribes || {}).length} tribes</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-5">
          {Object.entries(form.tribes || {}).map(([key, t]: [string, any]) => (
            <div key={key} className="bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Name</label>
                  <input value={t.name} onChange={e => updateTribe(key, 'name', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Color</label>
                  <div className="flex gap-2 items-center">
                    <button type="button" className="w-8 h-8 rounded border border-gray-600 flex-shrink-0" style={{ backgroundColor: t.color }}
                      onClick={() => setActiveColor(activeColor === key ? null : key)} />
                    <input value={t.color} onChange={e => updateTribe(key, 'color', e.target.value)}
                      className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
                  </div>
                  {activeColor === key && (
                    <div className="mt-2"><HexColorPicker color={t.color} onChange={c => updateTribe(key, 'color', c)} /></div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Description</label>
                <input value={t.description} onChange={e => updateTribe(key, 'description', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Aliases</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(t.aliases || []).map((alias: string, i: number) => (
                    <div key={i} className="flex items-center gap-1">
                      <input value={alias} onChange={e => updateAlias(key, i, e.target.value)}
                        className="w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white" />
                      <button type="button" onClick={() => removeAlias(key, i)} className="text-gray-500 hover:text-red-400"><X size={12} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addAlias(key)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white border border-dashed border-gray-700 rounded">
                    <Plus size={10} /> Add
                  </button>
                </div>
              </div>
              <div>
                <ImageUploadField value={t.iconUrl || ''} onChange={url => updateTribe(key, 'iconUrl', url)} label="Tribe Icon" folder="theme-assets" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
