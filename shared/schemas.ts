import { z } from 'zod';
import {
  TribeType, AbilityTrigger, AbilityEffectType, EffectType,
  SynergyTrigger, SynergyEffect, SynergyTarget,
} from './enums';

const tribeTypeSchema = z.nativeEnum(TribeType);
const abilityTriggerSchema = z.nativeEnum(AbilityTrigger);
const abilityEffectTypeSchema = z.nativeEnum(AbilityEffectType);
const effectTypeSchema = z.nativeEnum(EffectType);
const synergyTriggerSchema = z.nativeEnum(SynergyTrigger);
const synergyEffectSchema = z.nativeEnum(SynergyEffect);
const synergyTargetSchema = z.nativeEnum(SynergyTarget);

export const cardSchema = z.object({
  id: z.string().min(1).max(64),
  cardName: z.string().min(1).max(64),
  tier: z.number().int().min(1).max(6),
  attack: z.number().int().min(0).max(99),
  health: z.number().int().min(1).max(99),
  tribes: z.array(tribeTypeSchema).min(1),
  imageUrl: z.string().default(''),
  ability: z.string().default(''),
  abilityTrigger: abilityTriggerSchema,
  abilityEffect: abilityEffectTypeSchema,
  abilityValue: z.number().int().min(0).max(99),
  effectType: effectTypeSchema.default(EffectType.NoEffect),
  buyCostModifier: z.number().int().min(-5).max(5).default(0),
  sellValueModifier: z.number().int().min(-5).max(5).default(0),
});

export const synergyTierSchema = z.object({
  threshold: z.number().int().min(1).max(7),
  trigger: synergyTriggerSchema,
  effect: synergyEffectSchema,
  target: synergyTargetSchema,
  value: z.number().int().min(0).max(99),
  description: z.string(),
});

export const synergyComboSchema = z.object({
  tribe: tribeTypeSchema,
  threshold: z.number().int().min(1).max(7),
  effect: synergyEffectSchema,
  value: z.number().int().min(0).max(99),
  description: z.string(),
});

export const synergySchema = z.object({
  tribeType: tribeTypeSchema,
  tribeName: z.string().min(1),
  description: z.string(),
  themeColor: z.string(),
  tiers: z.array(synergyTierSchema).min(1),
  combo: synergyComboSchema.optional(),
});

export const gameConfigSchema = z.object({
  tierCopies: z.record(z.coerce.number(), z.number().int().min(1)),
  shopSizes: z.record(z.coerce.number(), z.number().int().min(1)),
  baseBuyCost: z.number().int().min(1).max(20),
  goldenMultiplier: z.number().min(1).max(5),
  recruitTimerSeconds: z.number().min(10).max(120),
  startingGold: z.number().int().min(0).max(20),
  goldPerTurnBase: z.number().int().min(0).max(20),
  maxGold: z.number().int().min(1).max(30),
  tavernUpgradeCosts: z.record(z.coerce.number(), z.number().int().min(0)),
  startingHealth: z.number().int().min(1).max(100),
  maxBoardSize: z.number().int().min(1).max(10),
  maxHandSize: z.number().int().min(1).max(20),
});

export const tribeThemeSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  aliases: z.array(z.string()).optional(),
  iconUrl: z.string().optional(),
});

export const themeSchema = z.object({
  gameName: z.string().min(1),
  tribes: z.record(z.string(), tribeThemeSchema),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    positive: z.string(),
    negative: z.string(),
    textColorLight: z.string().optional(),
    textColorDark: z.string().optional(),
    gameBackgroundColor: z.string().optional(),
    cardBackgroundColor: z.string().optional(),
    goldenCardColor: z.string().optional(),
  }),
  uiText: z.object({
    shopTitle: z.string(),
    handTitle: z.string(),
    boardTitle: z.string(),
    buyButton: z.string(),
    sellButton: z.string(),
    coinsLabel: z.string().optional(),
    healthLabel: z.string().optional(),
    tierLabel: z.string().optional(),
    playButton: z.string().optional(),
    rerollButton: z.string().optional(),
    upgradeButton: z.string().optional(),
    maxTierText: z.string().optional(),
    freezeButton: z.string().optional(),
    unfreezeButton: z.string().optional(),
    endTurnButton: z.string().optional(),
    combatPhaseTitle: z.string().optional(),
    recruitPhaseTitle: z.string().optional(),
    victoryText: z.string().optional(),
    defeatText: z.string().optional(),
    tieText: z.string().optional(),
    gameOverTitle: z.string().optional(),
    playAgainText: z.string().optional(),
    quitToMenuText: z.string().optional(),
  }),
  assets: z.object({
    gameBackground: z.string().optional(),
    cardFrameCommon: z.string().optional(),
    cardFrameRare: z.string().optional(),
    cardFrameEpic: z.string().optional(),
    cardBack: z.string().optional(),
    panelBackground: z.string().optional(),
    buttonNormal: z.string().optional(),
    buttonHighlighted: z.string().optional(),
    buttonPressed: z.string().optional(),
    buttonDisabled: z.string().optional(),
    coinIcon: z.string().optional(),
    healthIcon: z.string().optional(),
    attackIcon: z.string().optional(),
    shieldIcon: z.string().optional(),
  }).optional(),
});

export type CardInput = z.infer<typeof cardSchema>;
export type SynergyInput = z.infer<typeof synergySchema>;
export type GameConfigInput = z.infer<typeof gameConfigSchema>;
export type ThemeInput = z.infer<typeof themeSchema>;
