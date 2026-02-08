# Tarot DevZone

> Web-based editor and deployment tool for Tarot Battlegrounds game data

## Overview

Tarot DevZone is a full-stack web app that lets designers create and publish game data (cards, synergies, balance config, and visual themes) to S3, where the Unity game client fetches it at runtime.

**Stack:** React + TanStack Query (client), Express on Lambda (server), S3 + DynamoDB (storage), CloudFront (CDN)

---

## Architecture

```
client/ (React + Vite)        shared/ (Types + Zod schemas)       server/ (Express + Lambda)
  components/                    types.ts                            routes/
    cards/CardEditor.tsx           schemas.ts                          cards.ts
    cards/CardForm.tsx             enums.ts                            synergies.ts
    theme/ThemeEditor.tsx                                              config.ts
    theme/sections/*.tsx                                               theme.ts
    deploy/DeployPanel.tsx                                             images.ts
    common/ImageUploadField.tsx                                        deploy.ts
  services/api.ts                                                     versions.ts
                                                                    services/
                                                                      s3.ts
                                                                      version.ts
aws/
  template.yaml (SAM template)
```

### Data Flow

1. Designer edits data in DevZone UI
2. Client calls API (`PUT /api/cards/:id`, `PUT /api/theme`, etc.)
3. Server validates with Zod schemas, stores to `drafts/*.json` on S3
4. Designer clicks "Publish to Live"
5. Server copies `drafts/*.json` → `live/*.json`, invalidates CloudFront
6. Unity game fetches `live/cards.json`, `live/synergies.json`, `live/config.json`, `live/theme.json` at startup

### Image Storage

- Card images: `live/images/{filename}` on S3
- Theme assets: `live/theme-assets/{filename}` on S3
- Images are uploaded directly to the live path (no draft/live cycle for binaries)
- Upload endpoint: `POST /api/images/upload` with `folder` body param

---

## Editors

### Card Editor
- Left panel: searchable card list with tribe/tier filters
- Right panel: card form with all fields (name, stats, tribes, abilities, modifiers)
- **Image Upload**: drag-and-drop zone using `react-dropzone`, with thumbnail preview and manual URL fallback

### Theme Editor
Five collapsible sections covering every visual customization the Unity game supports:

| Section | Fields | Description |
|---------|--------|-------------|
| Game Identity | gameName | Game title displayed in UI |
| Tribe Themes | 4 tribes x (name, description, color, aliases, icon) | Per-tribe visual identity |
| Color Palette | 10 hex colors | Primary, secondary, accent, text, background, card colors |
| UI Text | 23 text strings | All button labels, phase titles, game over text |
| Visual Assets | 14 sprite uploads | Backgrounds, card frames, UI panels, icons |

All new fields are **optional** for backward compatibility. The theme editor merges saved data with defaults matching Unity's `CreateDefaultTarotTheme()`.

### Deploy Panel
- "Publish to Live" button copies all 4 JSON files from drafts → live
- Polls CloudFront invalidation status
- Link to live game (configurable via `VITE_GAME_URL` env var)

### Version Control
- Create named snapshots of all data files
- Compare any snapshot against live (VersionDiff)
- Publish or rollback to any snapshot

---

## Shared Data Model

The source of truth for all data types lives in `shared/types.ts` with validation in `shared/schemas.ts`.

### ThemeData

```typescript
interface ThemeData {
  gameName: string;
  tribes: Record<string, TribeThemeData>;  // keyed by tribe name
  colors: {
    primary, secondary, accent, positive, negative: string;          // required
    textColorLight?, textColorDark?, gameBackgroundColor?,            // optional
    cardBackgroundColor?, goldenCardColor?: string;
  };
  uiText: {
    shopTitle, handTitle, boardTitle, buyButton, sellButton: string;  // required
    coinsLabel?, healthLabel?, tierLabel?, playButton?,               // optional
    rerollButton?, upgradeButton?, maxTierText?, freezeButton?,
    unfreezeButton?, endTurnButton?, combatPhaseTitle?,
    recruitPhaseTitle?, victoryText?, defeatText?, tieText?,
    gameOverTitle?, playAgainText?, quitToMenuText?: string;
  };
  assets?: {                                                          // optional
    gameBackground?, cardFrameCommon?, cardFrameRare?, cardFrameEpic?,
    cardBack?, panelBackground?, buttonNormal?, buttonHighlighted?,
    buttonPressed?, buttonDisabled?, coinIcon?, healthIcon?,
    attackIcon?, shieldIcon?: string;
  };
}

interface TribeThemeData {
  name: string;
  description: string;
  color: string;           // hex e.g. "#d9a61f"
  aliases?: string[];      // alternative names for CSV import
  iconUrl?: string;        // S3 URL for tribe icon sprite
}
```

---

## AWS Infrastructure

Defined in `aws/template.yaml` (SAM template).

### Core Resources (always created)
- **GameDataBucket** — S3 bucket for game data and images
- **DevZoneFrontendBucket** — S3 website hosting for React app
- **UsersTable** — DynamoDB for user accounts
- **VersionsTable** — DynamoDB for version snapshots
- **DevZoneApi** — Lambda function running Express server

### Custom Domain Resources (conditional)

Created only when `DomainName` parameter is provided:

- **DevZoneDistribution** — CloudFront for `devzone.{domain}` (SPA routing, HTTPS)
- **GameDataDistribution** — CloudFront for `data.{domain}` (CORS, caching)
- **Route53 A records** — Alias records for both distributions

See [Custom Domain Setup](./custom-domain-setup.md) for deployment instructions.

---

## Development

### Prerequisites
- Node.js 20+
- npm (workspaces)

### Local Dev
```bash
cd tarot-devzone
npm install
npm run dev          # starts client (5173) + server (3001)
```

### Type Checking
```bash
npx tsc --noEmit --project shared/tsconfig.json
npx tsc --noEmit --project server/tsconfig.json
npx tsc --noEmit --project client/tsconfig.json
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL | `/api` |
| `VITE_GAME_URL` | Live game URL for Deploy panel link | `https://dui22oafwco41.cloudfront.net` |
