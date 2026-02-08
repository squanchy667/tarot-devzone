import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import GameIdentitySection from './sections/GameIdentitySection';
import TribeThemesSection from './sections/TribeThemesSection';
import ColorPaletteSection from './sections/ColorPaletteSection';
import UITextSection from './sections/UITextSection';
import VisualAssetsSection from './sections/VisualAssetsSection';

const DEFAULT_THEME: any = {
  gameName: 'Tarot Battlegrounds',
  tribes: {
    Pentacles: { name: 'Pentacles', description: 'The suit of Earth and material wealth. Grants economic advantages.', color: '#d9a61f', aliases: ['pentacle', 'earth', 'coins'], iconUrl: '' },
    Cups: { name: 'Cups', description: 'The suit of Water and emotions. Restores health and grants protection.', color: '#4d80e6', aliases: ['cup', 'water', 'chalice'], iconUrl: '' },
    Swords: { name: 'Swords', description: 'The suit of Air and conflict. Deals devastating damage.', color: '#bfbfd9', aliases: ['sword', 'air', 'blade'], iconUrl: '' },
    Wands: { name: 'Wands', description: 'The suit of Fire and creation. Empowers allies with stat buffs.', color: '#e66633', aliases: ['wand', 'fire', 'staff'], iconUrl: '' },
  },
  colors: {
    primary: '#7c3aed',
    secondary: '#261e33',
    accent: '#f59e0b',
    positive: '#22c55e',
    negative: '#ef4444',
    textColorLight: '#ffffff',
    textColorDark: '#1a1a26',
    gameBackgroundColor: '#140f1f',
    cardBackgroundColor: '#1f1a2e',
    goldenCardColor: '#ffd933',
  },
  uiText: {
    shopTitle: 'Tavern', handTitle: 'Hand', boardTitle: 'Battlefield', buyButton: 'Buy', sellButton: 'Sell',
    coinsLabel: 'Gold', healthLabel: 'Life', tierLabel: 'Tier',
    playButton: 'Deploy', rerollButton: 'Reroll', upgradeButton: 'Upgrade', maxTierText: 'MAX',
    freezeButton: 'Freeze', unfreezeButton: 'Unfreeze', endTurnButton: 'End Turn',
    combatPhaseTitle: 'Combat Phase', recruitPhaseTitle: 'Recruit Phase',
    victoryText: 'Victory!', defeatText: 'Defeat!', tieText: 'Draw!',
    gameOverTitle: 'Game Over', playAgainText: 'Play Again', quitToMenuText: 'Quit to Menu',
  },
  assets: {},
};

export default function ThemeEditor() {
  const qc = useQueryClient();
  const { data: theme, isLoading } = useQuery({ queryKey: ['theme'], queryFn: () => api.getTheme() });
  const save = useMutation({ mutationFn: (t: any) => api.updateTheme(t), onSuccess: () => qc.invalidateQueries({ queryKey: ['theme'] }) });
  const [form, setForm] = useState<any>(DEFAULT_THEME);

  useEffect(() => {
    if (theme) {
      setForm({
        ...DEFAULT_THEME,
        ...theme,
        colors: { ...DEFAULT_THEME.colors, ...theme.colors },
        uiText: { ...DEFAULT_THEME.uiText, ...theme.uiText },
        assets: { ...DEFAULT_THEME.assets, ...theme.assets },
        tribes: theme.tribes ? Object.fromEntries(
          Object.entries(theme.tribes).map(([k, v]: [string, any]) => [k, { ...DEFAULT_THEME.tribes[k], ...v }])
        ) : DEFAULT_THEME.tribes,
      });
    }
  }, [theme]);

  if (isLoading) return <div className="text-gray-400">Loading theme...</div>;

  return (
    <div className="space-y-4 max-w-3xl pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Theme Editor</h2>
      </div>

      <GameIdentitySection form={form} setForm={setForm} />
      <TribeThemesSection form={form} setForm={setForm} />
      <ColorPaletteSection form={form} setForm={setForm} />
      <UITextSection form={form} setForm={setForm} />
      <VisualAssetsSection form={form} setForm={setForm} />

      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur border-t border-gray-800 p-3 flex justify-end z-50">
        <button onClick={() => save.mutate(form)} disabled={save.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-lg font-medium transition-colors disabled:opacity-50">
          <Save size={16} /> {save.isPending ? 'Saving...' : 'Save Theme'}
        </button>
      </div>
    </div>
  );
}
