import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Props {
  form: any;
  setForm: (f: any) => void;
}

const inputCls = 'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-brand-500';

export default function GameIdentitySection({ form, setForm }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-4 text-left font-semibold hover:bg-gray-800/50 rounded-t-xl transition-colors">
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        Game Identity
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Game Name</label>
            <input value={form.gameName} onChange={e => setForm({ ...form, gameName: e.target.value })} className={inputCls} />
          </div>
        </div>
      )}
    </section>
  );
}
