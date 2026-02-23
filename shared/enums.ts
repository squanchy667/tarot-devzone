export enum TribeType {
  None = 'None',
  Pentacles = 'Pentacles',
  Cups = 'Cups',
  Swords = 'Swords',
  Wands = 'Wands',
  Stars = 'Stars',
  Coins = 'Coins',
}

export enum AbilityTrigger {
  None = 'None',
  Battlecry = 'Battlecry',
  Deathrattle = 'Deathrattle',
  OnAttack = 'OnAttack',
  OnDamaged = 'OnDamaged',
  StartOfCombat = 'StartOfCombat',
  EndOfTurn = 'EndOfTurn',
  // Phase II (T101-T104)
  OnAllyDeath = 'OnAllyDeath',
  OnAllySummoned = 'OnAllySummoned',
  OnSell = 'OnSell',
  Aura = 'Aura',
}

export enum AbilityEffectType {
  None = 'None',
  // Battlecry effects
  BuffAdjacentAttack = 'BuffAdjacentAttack',
  BuffAdjacentHealth = 'BuffAdjacentHealth',
  BuffAdjacentStats = 'BuffAdjacentStats',
  BuffAllFriendlyAttack = 'BuffAllFriendlyAttack',
  BuffOtherFriendlyAttack = 'BuffOtherFriendlyAttack',
  GainAegis = 'GainAegis',
  GainCoins = 'GainCoins',
  // Deathrattle effects
  DeathrattleBuffRandomFriendly = 'DeathrattleBuffRandomFriendly',
  DeathrattleDamageRandomEnemy = 'DeathrattleDamageRandomEnemy',
  DeathrattleDamageAllEnemies = 'DeathrattleDamageAllEnemies',
  // OnAttack effects
  OnAttackBuffSelf = 'OnAttackBuffSelf',
  OnAttackBonusDamage = 'OnAttackBonusDamage',
  OnAttackCleave = 'OnAttackCleave',
  // Passive
  Taunt = 'Taunt',
  // Phase II (T101-T104): New trigger effects
  OnAllyDeathBuffSelf = 'OnAllyDeathBuffSelf',
  OnAllyDeathBuffRandom = 'OnAllyDeathBuffRandom',
  OnAllySummonedBuffSummoned = 'OnAllySummonedBuffSummoned',
  OnAllySummonedBuffSelf = 'OnAllySummonedBuffSelf',
  OnSellGainCoins = 'OnSellGainCoins',
  OnSellBuffAllRemaining = 'OnSellBuffAllRemaining',
  AuraBuffTribematesAttack = 'AuraBuffTribematesAttack',
  AuraBuffAdjacentStats = 'AuraBuffAdjacentStats',
  AuraBuffAllFriendlyAttack = 'AuraBuffAllFriendlyAttack',
  // Phase II (T105-T112): New ability effects
  Reborn = 'Reborn',
  Windfury = 'Windfury',
  Venomous = 'Venomous',
  SummonTokenOnDeath = 'SummonTokenOnDeath',
  SummonTokenOnPlay = 'SummonTokenOnPlay',
  StealBuffOnAttack = 'StealBuffOnAttack',
  GainArmor = 'GainArmor',
  BuffAllTribeOnPlay = 'BuffAllTribeOnPlay',
  BuffAllTribeOnDeath = 'BuffAllTribeOnDeath',
  RandomTransformOnDeath = 'RandomTransformOnDeath',
  BuffSelfHealth = 'BuffSelfHealth',
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
