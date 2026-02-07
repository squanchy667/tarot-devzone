/**
 * Export current C# game data to JSON files.
 * Run: npx tsx scripts/export-game-data.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const OUT_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(OUT_DIR, { recursive: true });

const cards = [
  { id: "coin-apprentice", cardName: "Coin Apprentice", tier: 1, attack: 1, health: 2, tribes: ["Pentacles"], imageUrl: "", ability: "A young merchant learning the trade.", abilityTrigger: "None", abilityEffect: "None", abilityValue: 0, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "spring-sprite", cardName: "Spring Sprite", tier: 1, attack: 1, health: 3, tribes: ["Cups"], imageUrl: "", ability: "A tiny water spirit.", abilityTrigger: "None", abilityEffect: "None", abilityValue: 0, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "dagger-initiate", cardName: "Dagger Initiate", tier: 1, attack: 2, health: 1, tribes: ["Swords"], imageUrl: "", ability: "Quick but fragile.", abilityTrigger: "None", abilityEffect: "None", abilityValue: 0, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "spark-wisp", cardName: "Spark Wisp", tier: 1, attack: 2, health: 2, tribes: ["Wands"], imageUrl: "", ability: "A floating ember.", abilityTrigger: "None", abilityEffect: "None", abilityValue: 0, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "tarot-seeker", cardName: "Tarot Seeker", tier: 1, attack: 1, health: 2, tribes: ["Pentacles", "Cups"], imageUrl: "", ability: "Seeks knowledge of the cards. (Dual tribe)", abilityTrigger: "None", abilityEffect: "None", abilityValue: 0, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "gold-collector", cardName: "Gold Collector", tier: 2, attack: 2, health: 3, tribes: ["Pentacles"], imageUrl: "", ability: "Battlecry: Gain 1 gold.", abilityTrigger: "Battlecry", abilityEffect: "GainCoins", abilityValue: 1, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "healing-wave", cardName: "Healing Wave", tier: 2, attack: 1, health: 4, tribes: ["Cups"], imageUrl: "", ability: "Battlecry: Gain Aegis.", abilityTrigger: "Battlecry", abilityEffect: "GainAegis", abilityValue: 1, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "blade-squire", cardName: "Blade Squire", tier: 2, attack: 3, health: 2, tribes: ["Swords"], imageUrl: "", ability: "OnAttack: Deal 1 extra damage.", abilityTrigger: "OnAttack", abilityEffect: "OnAttackBonusDamage", abilityValue: 1, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "flame-enchanter", cardName: "Flame Enchanter", tier: 2, attack: 2, health: 3, tribes: ["Wands"], imageUrl: "", ability: "Battlecry: Give adjacent minions +1 Attack.", abilityTrigger: "Battlecry", abilityEffect: "BuffAdjacentAttack", abilityValue: 1, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "river-guard", cardName: "River Guard", tier: 2, attack: 2, health: 4, tribes: ["Cups"], imageUrl: "", ability: "Guardian - Must be attacked first.", abilityTrigger: "None", abilityEffect: "Taunt", abilityValue: 0, effectType: "Guardian", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "treasure-master", cardName: "Treasure Master", tier: 3, attack: 3, health: 4, tribes: ["Pentacles"], imageUrl: "", ability: "Deathrattle: Give a random friendly minion +2/+2.", abilityTrigger: "Deathrattle", abilityEffect: "DeathrattleBuffRandomFriendly", abilityValue: 2, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "tidal-priest", cardName: "Tidal Priest", tier: 3, attack: 2, health: 5, tribes: ["Cups"], imageUrl: "", ability: "Battlecry: Gain Aegis.", abilityTrigger: "Battlecry", abilityEffect: "GainAegis", abilityValue: 1, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "sword-captain", cardName: "Sword Captain", tier: 3, attack: 4, health: 3, tribes: ["Swords"], imageUrl: "", ability: "Battlecry: Give all friendly minions +1 Attack.", abilityTrigger: "Battlecry", abilityEffect: "BuffAllFriendlyAttack", abilityValue: 1, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "inferno-mage", cardName: "Inferno Mage", tier: 3, attack: 3, health: 4, tribes: ["Wands"], imageUrl: "", ability: "Deathrattle: Deal 2 damage to all enemies.", abilityTrigger: "Deathrattle", abilityEffect: "DeathrattleDamageAllEnemies", abilityValue: 2, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "mercenary", cardName: "Mercenary", tier: 3, attack: 4, health: 4, tribes: ["Swords", "Pentacles"], imageUrl: "", ability: "OnAttack: Gain +1 Attack. (Dual tribe)", abilityTrigger: "OnAttack", abilityEffect: "OnAttackBuffSelf", abilityValue: 1, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "wealthy-baron", cardName: "Wealthy Baron", tier: 4, attack: 3, health: 5, tribes: ["Pentacles"], imageUrl: "", ability: "Battlecry: Gain 2 gold.", abilityTrigger: "Battlecry", abilityEffect: "GainCoins", abilityValue: 2, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "ocean-guardian", cardName: "Ocean Guardian", tier: 4, attack: 3, health: 7, tribes: ["Cups"], imageUrl: "", ability: "Guardian - Must be attacked first.", abilityTrigger: "None", abilityEffect: "Taunt", abilityValue: 0, effectType: "Guardian", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "blade-master", cardName: "Blade Master", tier: 4, attack: 6, health: 4, tribes: ["Swords"], imageUrl: "", ability: "OnAttack: Deal 2 damage to adjacent enemies.", abilityTrigger: "OnAttack", abilityEffect: "OnAttackCleave", abilityValue: 2, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "phoenix-caller", cardName: "Phoenix Caller", tier: 4, attack: 4, health: 5, tribes: ["Wands"], imageUrl: "", ability: "Deathrattle: Give a random friendly minion +3/+3.", abilityTrigger: "Deathrattle", abilityEffect: "DeathrattleBuffRandomFriendly", abilityValue: 3, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "ember-healer", cardName: "Ember Healer", tier: 4, attack: 3, health: 6, tribes: ["Cups", "Wands"], imageUrl: "", ability: "Battlecry: Give adjacent minions +1/+1. (Dual tribe)", abilityTrigger: "Battlecry", abilityEffect: "BuffAdjacentStats", abilityValue: 1, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "dragon-hoarder", cardName: "Dragon Hoarder", tier: 5, attack: 5, health: 6, tribes: ["Pentacles"], imageUrl: "", ability: "Battlecry: Gain 3 gold.", abilityTrigger: "Battlecry", abilityEffect: "GainCoins", abilityValue: 3, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "tsunami-lord", cardName: "Tsunami Lord", tier: 5, attack: 4, health: 8, tribes: ["Cups"], imageUrl: "", ability: "Battlecry: Gain Aegis. Guardian.", abilityTrigger: "Battlecry", abilityEffect: "GainAegis", abilityValue: 1, effectType: "Guardian", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "blade-storm", cardName: "Blade Storm", tier: 5, attack: 7, health: 5, tribes: ["Swords"], imageUrl: "", ability: "OnAttack: Deal 2 extra damage.", abilityTrigger: "OnAttack", abilityEffect: "OnAttackBonusDamage", abilityValue: 2, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "archmage", cardName: "Archmage", tier: 5, attack: 5, health: 6, tribes: ["Wands"], imageUrl: "", ability: "Battlecry: Give all friendly minions +2 Attack.", abilityTrigger: "Battlecry", abilityEffect: "BuffAllFriendlyAttack", abilityValue: 2, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "battle-mage", cardName: "Battle Mage", tier: 5, attack: 6, health: 6, tribes: ["Wands", "Swords"], imageUrl: "", ability: "OnAttack: Gain +2 Attack permanently. (Dual tribe)", abilityTrigger: "OnAttack", abilityEffect: "OnAttackBuffSelf", abilityValue: 2, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "golden-emperor", cardName: "Golden Emperor", tier: 6, attack: 6, health: 8, tribes: ["Pentacles"], imageUrl: "", ability: "Battlecry: Gain 4 gold.", abilityTrigger: "Battlecry", abilityEffect: "GainCoins", abilityValue: 4, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "leviathan", cardName: "Leviathan", tier: 6, attack: 5, health: 12, tribes: ["Cups"], imageUrl: "", ability: "Guardian - Massive health pool.", abilityTrigger: "None", abilityEffect: "Taunt", abilityValue: 0, effectType: "Guardian", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "doom-blade", cardName: "Doom Blade", tier: 6, attack: 10, health: 6, tribes: ["Swords"], imageUrl: "", ability: "OnAttack: Deal 3 damage to adjacent enemies.", abilityTrigger: "OnAttack", abilityEffect: "OnAttackCleave", abilityValue: 3, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "inferno-dragon", cardName: "Inferno Dragon", tier: 6, attack: 7, health: 7, tribes: ["Wands"], imageUrl: "", ability: "Deathrattle: Deal 4 damage to all enemies.", abilityTrigger: "Deathrattle", abilityEffect: "DeathrattleDamageAllEnemies", abilityValue: 4, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
  { id: "arcane-trinity", cardName: "Arcane Trinity", tier: 6, attack: 6, health: 8, tribes: ["Cups", "Wands", "Swords"], imageUrl: "", ability: "Battlecry: Give adjacent minions +2/+2. (Triple tribe)", abilityTrigger: "Battlecry", abilityEffect: "BuffAdjacentStats", abilityValue: 2, effectType: "NoEffect", buyCostModifier: 0, sellValueModifier: 0 },
];

const synergies = [
  { tribeType: "Pentacles", tribeName: "Pentacles", description: "Earth/Economy theme - gold bonuses", themeColor: "#d4a017",
    tiers: [
      { threshold: 2, trigger: "OnSell", effect: "BonusGold", target: "Self", value: 1, description: "(2) +1 gold when selling Pentacles cards" },
      { threshold: 4, trigger: "OnSell", effect: "BonusGold", target: "Self", value: 2, description: "(4) +2 gold when selling Pentacles cards" },
      { threshold: 6, trigger: "Passive", effect: "ReduceCost", target: "AllTribeMembers", value: 1, description: "(6) Pentacles cards cost 1 less to buy" },
    ], combo: { tribe: "Cups", threshold: 2, effect: "BonusGold", value: 1, description: "Pentacles + Cups (2 each): +1 gold at end of turn" } },
  { tribeType: "Cups", tribeName: "Cups", description: "Water/Healing theme - restoration effects", themeColor: "#4fc3f7",
    tiers: [
      { threshold: 2, trigger: "EndOfTurn", effect: "HealFlat", target: "Adjacent", value: 1, description: "(2) Heal adjacent cards for 1 at end of turn" },
      { threshold: 4, trigger: "EndOfTurn", effect: "HealFlat", target: "AllTribeMembers", value: 2, description: "(4) Heal all Cups for 2 at end of turn" },
      { threshold: 6, trigger: "StartOfCombat", effect: "Shield", target: "AllFriendly", value: 1, description: "(6) All friendly cards gain Aegis at start of combat" },
    ], combo: { tribe: "Wands", threshold: 2, effect: "BuffAttack", value: 1, description: "Cups + Wands (2 each): Healing also grants +1 attack" } },
  { tribeType: "Swords", tribeName: "Swords", description: "Air/Aggro theme - damage bonuses", themeColor: "#ef5350",
    tiers: [
      { threshold: 2, trigger: "StartOfCombat", effect: "BuffAttack", target: "AllTribeMembers", value: 1, description: "(2) Swords cards gain +1 attack at start of combat" },
      { threshold: 4, trigger: "StartOfCombat", effect: "BonusDamage", target: "AllTribeMembers", value: 2, description: "(4) Swords cards deal +2 bonus damage" },
      { threshold: 6, trigger: "Passive", effect: "Cleave", target: "AllTribeMembers", value: 1, description: "(6) Swords attacks hit adjacent enemies" },
    ], combo: { tribe: "Pentacles", threshold: 2, effect: "BonusGold", value: 1, description: "Swords + Pentacles (2 each): Killing enemies grants +1 gold" } },
  { tribeType: "Wands", tribeName: "Wands", description: "Fire/Buff theme - stat increases", themeColor: "#ff9800",
    tiers: [
      { threshold: 2, trigger: "EndOfTurn", effect: "BuffStats", target: "Random", value: 1, description: "(2) Give a random friendly +1/+1 at end of turn" },
      { threshold: 4, trigger: "EndOfTurn", effect: "BuffStats", target: "AllTribeMembers", value: 1, description: "(4) Give all Wands +1/+1 at end of turn" },
      { threshold: 6, trigger: "StartOfCombat", effect: "BuffAttack", target: "AllFriendly", value: 2, description: "(6) All friendly cards gain +2 attack at start of combat" },
    ], combo: { tribe: "Swords", threshold: 2, effect: "BuffAttack", value: 1, description: "Wands + Swords (2 each): Attack buffs are doubled" } },
];

const config = {
  tierCopies: { 1: 16, 2: 15, 3: 13, 4: 11, 5: 9, 6: 7 },
  shopSizes: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5, 6: 6 },
  baseBuyCost: 3, goldenMultiplier: 2, recruitTimerSeconds: 35,
  startingGold: 3, goldPerTurnBase: 1, maxGold: 10,
  tavernUpgradeCosts: { 2: 5, 3: 8, 4: 11, 5: 11, 6: 11 },
  startingHealth: 40, maxBoardSize: 7, maxHandSize: 10,
};

const theme = {
  gameName: "Tarot Battlegrounds",
  tribes: {
    Pentacles: { name: "Pentacles", description: "Earth/Economy - Gold bonuses", color: "#d4a017" },
    Cups: { name: "Cups", description: "Water/Healing - Restoration effects", color: "#4fc3f7" },
    Swords: { name: "Swords", description: "Air/Aggro - Damage bonuses", color: "#ef5350" },
    Wands: { name: "Wands", description: "Fire/Buffs - Stat increases", color: "#ff9800" },
  },
  colors: { primary: "#7c3aed", secondary: "#1e1b4b", accent: "#f59e0b", positive: "#22c55e", negative: "#ef4444" },
  uiText: { shopTitle: "Shop", handTitle: "Hand", boardTitle: "Board", buyButton: "Buy", sellButton: "Sell" },
};

fs.writeFileSync(path.join(OUT_DIR, 'cards.json'), JSON.stringify(cards, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'synergies.json'), JSON.stringify(synergies, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'config.json'), JSON.stringify(config, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'theme.json'), JSON.stringify(theme, null, 2));

console.log(`Exported game data to ${OUT_DIR}/`);
console.log(`  cards.json: ${cards.length} cards`);
console.log(`  synergies.json: ${synergies.length} synergies`);
console.log(`  config.json: balance parameters`);
console.log(`  theme.json: visual theme`);
