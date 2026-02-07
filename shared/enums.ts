export enum TribeType {
  None = 'None',
  Pentacles = 'Pentacles',
  Cups = 'Cups',
  Swords = 'Swords',
  Wands = 'Wands',
}

export enum AbilityTrigger {
  None = 'None',
  Battlecry = 'Battlecry',
  Deathrattle = 'Deathrattle',
  OnAttack = 'OnAttack',
  OnDamaged = 'OnDamaged',
  StartOfCombat = 'StartOfCombat',
  EndOfTurn = 'EndOfTurn',
}

export enum AbilityEffectType {
  None = 'None',
  BuffAdjacentAttack = 'BuffAdjacentAttack',
  BuffAdjacentHealth = 'BuffAdjacentHealth',
  BuffAdjacentStats = 'BuffAdjacentStats',
  BuffAllFriendlyAttack = 'BuffAllFriendlyAttack',
  BuffOtherFriendlyAttack = 'BuffOtherFriendlyAttack',
  GainAegis = 'GainAegis',
  GainCoins = 'GainCoins',
  DeathrattleBuffRandomFriendly = 'DeathrattleBuffRandomFriendly',
  DeathrattleDamageRandomEnemy = 'DeathrattleDamageRandomEnemy',
  DeathrattleDamageAllEnemies = 'DeathrattleDamageAllEnemies',
  OnAttackBuffSelf = 'OnAttackBuffSelf',
  OnAttackBonusDamage = 'OnAttackBonusDamage',
  OnAttackCleave = 'OnAttackCleave',
  Taunt = 'Taunt',
}

export enum EffectType {
  NoEffect = 'NoEffect',
  Summoning = 'Summoning',
  LastReading = 'LastReading',
  Guardian = 'Guardian',
  Aegis = 'Aegis',
  Echo = 'Echo',
}

export enum SynergyTrigger {
  Passive = 'Passive',
  StartOfCombat = 'StartOfCombat',
  EndOfCombat = 'EndOfCombat',
  OnSell = 'OnSell',
  OnBuy = 'OnBuy',
  OnDeath = 'OnDeath',
  EndOfTurn = 'EndOfTurn',
}

export enum SynergyEffect {
  BuffAttack = 'BuffAttack',
  BuffHealth = 'BuffHealth',
  BuffStats = 'BuffStats',
  BonusGold = 'BonusGold',
  ReduceCost = 'ReduceCost',
  BonusDamage = 'BonusDamage',
  Piercing = 'Piercing',
  Cleave = 'Cleave',
  HealFlat = 'HealFlat',
  HealPercent = 'HealPercent',
  Shield = 'Shield',
  ExtraCardDraw = 'ExtraCardDraw',
  Discover = 'Discover',
}

export enum SynergyTarget {
  AllTribeMembers = 'AllTribeMembers',
  AllFriendly = 'AllFriendly',
  Adjacent = 'Adjacent',
  Random = 'Random',
  Self = 'Self',
}
