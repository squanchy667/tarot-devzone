import * as s3 from './s3';
import * as db from './dynamodb';
import type { CardData, SynergyData, GameConfigData, ThemeData, VersionDiff } from '@tarot-devzone/shared';

const DATA_FILES = ['cards.json', 'synergies.json', 'config.json', 'theme.json'];

export async function createVersionSnapshot(author: string, description: string): Promise<string> {
  const versions = await db.listVersions();
  const num = versions.length + 1;
  const versionId = `v${String(num).padStart(3, '0')}`;

  for (const file of DATA_FILES) {
    try {
      const data = await s3.getJson(`drafts/${file}`);
      await s3.putJson(`versions/${versionId}/${file}`, data);
    } catch {
      try {
        const data = await s3.getJson(`live/${file}`);
        await s3.putJson(`versions/${versionId}/${file}`, data);
      } catch { /* skip */ }
    }
  }

  const metadata = {
    versionId,
    timestamp: new Date().toISOString(),
    author,
    description,
    isLive: false,
  };
  await s3.putJson(`versions/${versionId}/metadata.json`, metadata);
  await db.createVersion(metadata);

  return versionId;
}

export async function publishVersion(versionId: string): Promise<void> {
  for (const file of DATA_FILES) {
    try {
      const data = await s3.getJson(`versions/${versionId}/${file}`);
      await s3.putJson(`live/${file}`, data);
    } catch { /* skip missing */ }
  }
  await db.setVersionLive(versionId);
}

export async function diffVersion(versionId: string): Promise<VersionDiff> {
  let versionCards: CardData[] = [];
  let liveCards: CardData[] = [];
  try { versionCards = await s3.getJson<CardData[]>(`versions/${versionId}/cards.json`); } catch {}
  try { liveCards = await s3.getJson<CardData[]>(`live/cards.json`); } catch {}

  const liveMap = new Map(liveCards.map(c => [c.id, c]));
  const versionMap = new Map(versionCards.map(c => [c.id, c]));

  const added = versionCards.filter(c => !liveMap.has(c.id));
  const removed = liveCards.filter(c => !versionMap.has(c.id));
  const modified: Array<{ before: CardData; after: CardData }> = [];
  for (const [id, card] of versionMap) {
    const live = liveMap.get(id);
    if (live && JSON.stringify(live) !== JSON.stringify(card)) {
      modified.push({ before: live, after: card });
    }
  }

  let versionSynergies: SynergyData[] = [];
  let liveSynergies: SynergyData[] = [];
  try { versionSynergies = await s3.getJson<SynergyData[]>(`versions/${versionId}/synergies.json`); } catch {}
  try { liveSynergies = await s3.getJson<SynergyData[]>(`live/synergies.json`); } catch {}

  const synergyMods: VersionDiff['synergies']['modified'] = [];
  for (const vs of versionSynergies) {
    const ls = liveSynergies.find(s => s.tribeType === vs.tribeType);
    if (ls && JSON.stringify(ls) !== JSON.stringify(vs)) {
      synergyMods.push({ tribe: vs.tribeType, before: ls, after: vs });
    }
  }

  let configDiff: VersionDiff['config'] = null;
  try {
    const vc = await s3.getJson<GameConfigData>(`versions/${versionId}/config.json`);
    const lc = await s3.getJson<GameConfigData>(`live/config.json`);
    if (JSON.stringify(vc) !== JSON.stringify(lc)) configDiff = { before: lc, after: vc };
  } catch {}

  let themeDiff: VersionDiff['theme'] = null;
  try {
    const vt = await s3.getJson<ThemeData>(`versions/${versionId}/theme.json`);
    const lt = await s3.getJson<ThemeData>(`live/theme.json`);
    if (JSON.stringify(vt) !== JSON.stringify(lt)) themeDiff = { before: lt, after: vt };
  } catch {}

  return {
    cards: { added, removed, modified },
    synergies: { modified: synergyMods },
    config: configDiff,
    theme: themeDiff,
  };
}
