import { useState } from 'react';
import { useCards, useCreateCard, useUpdateCard, useDeleteCard } from '../../hooks/useCards';
import { Plus, Trash2, Search } from 'lucide-react';
import CardForm from './CardForm';

const TRIBES = ['Pentacles', 'Cups', 'Swords', 'Wands'];

export default function CardEditor() {
  const { data: cards, isLoading } = useCards();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTribe, setFilterTribe] = useState('');
  const [filterTier, setFilterTier] = useState(0);

  const filtered = (cards || []).filter((c: any) => {
    if (search && !c.cardName.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTribe && !c.tribes?.includes(filterTribe)) return false;
    if (filterTier && c.tier !== filterTier) return false;
    return true;
  });

  const selected = cards?.find((c: any) => c.id === selectedId) || null;

  const handleSave = async (card: any) => {
    if (selectedId && selectedId !== '__new__' && cards?.some((c: any) => c.id === selectedId)) {
      await updateCard.mutateAsync({ id: selectedId, card });
    } else {
      await createCard.mutateAsync(card);
      setSelectedId(card.id);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm('Delete this card?')) return;
    await deleteCard.mutateAsync(selectedId);
    setSelectedId(null);
  };

  if (isLoading) return <div className="text-gray-400">Loading cards...</div>;

  return (
    <div className="flex gap-6 h-full">
      <div className="w-72 flex-shrink-0 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-bold flex-1">Cards</h2>
          <button onClick={() => setSelectedId('__new__')} className="p-1.5 rounded bg-brand-600 hover:bg-brand-700 transition-colors">
            <Plus size={16} />
          </button>
        </div>
        <div className="relative mb-2">
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cards..."
            className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-brand-500" />
        </div>
        <div className="flex gap-1 mb-2 flex-wrap">
          <button onClick={() => setFilterTribe('')} className={`px-2 py-0.5 rounded text-xs ${!filterTribe ? 'bg-brand-600' : 'bg-gray-800 text-gray-400'}`}>All</button>
          {TRIBES.map(t => (
            <button key={t} onClick={() => setFilterTribe(filterTribe === t ? '' : t)}
              className={`px-2 py-0.5 rounded text-xs ${filterTribe === t ? 'bg-brand-600' : 'bg-gray-800 text-gray-400'}`}>{t}</button>
          ))}
        </div>
        <div className="flex gap-1 mb-3 flex-wrap">
          {[0,1,2,3,4,5,6].map(t => (
            <button key={t} onClick={() => setFilterTier(filterTier === t ? 0 : t)}
              className={`px-2 py-0.5 rounded text-xs ${filterTier === t ? 'bg-brand-600' : 'bg-gray-800 text-gray-400'}`}>{t === 0 ? 'All' : `T${t}`}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.map((card: any) => (
            <button key={card.id} onClick={() => setSelectedId(card.id)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                selectedId === card.id ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30' : 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
              }`}>
              <div className="flex justify-between">
                <span className="font-medium truncate">{card.cardName}</span>
                <span className="text-xs text-gray-500">T{card.tier}</span>
              </div>
              <div className="text-xs text-gray-500">{card.attack}/{card.health} - {card.tribes?.join(', ')}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        {selectedId ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold flex-1">{selectedId === '__new__' ? 'New Card' : 'Edit Card'}</h3>
              {selectedId !== '__new__' && (
                <button onClick={handleDelete} className="p-1.5 rounded text-red-400 hover:bg-red-400/10 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <CardForm key={selectedId} card={selectedId === '__new__' ? null : selected} onSave={handleSave}
              saving={createCard.isPending || updateCard.isPending} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">Select a card or create a new one</div>
        )}
      </div>
    </div>
  );
}
