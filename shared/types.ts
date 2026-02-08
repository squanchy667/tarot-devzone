import {
  TribeType, AbilityTrigger, AbilityEffectType, EffectType,
  SynergyTrigger, SynergyEffect, SynergyTarget,
} from './enums';

export interface CardData {
  id: string;
  cardName: string;
  tier: number;
  attack: number;
  health: number;
  tribes: TribeType[];
  imageUrl: string;
  ability: string;
  abilityTrigger: AbilityTrigger;
  abilityEffect: AbilityEffectType;
  abilityValue: number;
  effectType: EffectType;
  buyCostModifier: number;
  sellValueModifier: number;
}

export interface SynergyTierData {
  threshold: number;
  trigger: SynergyTrigger;
  effect: SynergyEffect;
  target: SynergyTarget;
  value: number;
  description: string;
}

export interface SynergyComboData {
  tribe: TribeType;
  threshold: number;
  effect: SynergyEffect;
  value: number;
  description: string;
}

export interface SynergyData {
  tribeType: TribeType;
  tribeName: string;
  description: string;
  themeColor: string;
  tiers: SynergyTierData[];
  combo?: SynergyComboData;
}

export interface GameConfigData {
  tierCopies: Record<number, number>;
  shopSizes: Record<number, number>;
  baseBuyCost: number;
  goldenMultiplier: number;
  recruitTimerSeconds: number;
  startingGold: number;
  goldPerTurnBase: number;
  maxGold: number;
  tavernUpgradeCosts: Record<number, number>;
  startingHealth: number;
  maxBoardSize: number;
  maxHandSize: number;
}

export interface TribeThemeData {
  name: string;
  description: string;
  color: string;
  aliases?: string[];
  iconUrl?: string;
}

export interface ThemeData {
  gameName: string;
  tribes: Record<string, TribeThemeData>;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    positive: string;
    negative: string;
    textColorLight?: string;
    textColorDark?: string;
    gameBackgroundColor?: string;
    cardBackgroundColor?: string;
    goldenCardColor?: string;
  };
  uiText: {
    shopTitle: string;
    handTitle: string;
    boardTitle: string;
    buyButton: string;
    sellButton: string;
    coinsLabel?: string;
    healthLabel?: string;
    tierLabel?: string;
    playButton?: string;
    rerollButton?: string;
    upgradeButton?: string;
    maxTierText?: string;
    freezeButton?: string;
    unfreezeButton?: string;
    endTurnButton?: string;
    combatPhaseTitle?: string;
    recruitPhaseTitle?: string;
    victoryText?: string;
    defeatText?: string;
    tieText?: string;
    gameOverTitle?: string;
    playAgainText?: string;
    quitToMenuText?: string;
  };
  assets?: {
    gameBackground?: string;
    cardFrameCommon?: string;
    cardFrameRare?: string;
    cardFrameEpic?: string;
    cardBack?: string;
    panelBackground?: string;
    buttonNormal?: string;
    buttonHighlighted?: string;
    buttonPressed?: string;
    buttonDisabled?: string;
    coinIcon?: string;
    healthIcon?: string;
    attackIcon?: string;
    shieldIcon?: string;
  };
}

export interface VersionMetadata {
  versionId: string;
  timestamp: string;
  author: string;
  description: string;
  isLive: boolean;
}

export interface User {
  userId: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DeployStatus {
  invalidationId: string;
  status: 'InProgress' | 'Completed';
  createTime: string;
}

export interface VersionDiff {
  cards: { added: CardData[]; removed: CardData[]; modified: Array<{ before: CardData; after: CardData }> };
  synergies: { modified: Array<{ tribe: TribeType; before: SynergyData; after: SynergyData }> };
  config: { before: Partial<GameConfigData>; after: Partial<GameConfigData> } | null;
  theme: { before: Partial<ThemeData>; after: Partial<ThemeData> } | null;
}
