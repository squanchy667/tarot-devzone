/**
 * Check C#/TS enum parity between the Unity game and shared/enums.ts.
 * Compares member NAMES (order-insensitive). Exits 1 with a per-enum diff
 * on mismatch, exits 0 with a summary on match.
 *
 * Run: npx tsx scripts/check-enum-parity.ts   (or: make check-parity)
 * Env: UNITY_SRC — path to the Unity Assets/Scripts directory
 *      (default: ../TarotBattlegrounds-POC/TarotBattlegrounds-POC/Assets/Scripts)
 */
import * as fs from 'fs';
import * as path from 'path';

const UNITY_SRC = process.env.UNITY_SRC
  || path.join(__dirname, '..', '..', 'TarotBattlegrounds-POC', 'TarotBattlegrounds-POC', 'Assets', 'Scripts');
const TS_ENUMS_FILE = path.join(__dirname, '..', 'shared', 'enums.ts');

// Enums to compare: { enumName, C# source file relative to UNITY_SRC }
const ENUM_SOURCES: Array<{ name: string; file: string }> = [
  { name: 'TribeType', file: 'Synergies/TribeType.cs' },
  { name: 'AbilityTrigger', file: 'Abilities/AbilityTrigger.cs' },
  { name: 'SynergyTrigger', file: 'Synergies/SynergyTrigger.cs' },
  { name: 'SynergyEffect', file: 'Synergies/SynergyEffect.cs' },
  { name: 'SynergyTarget', file: 'Synergies/SynergyTarget.cs' },
  { name: 'AbilityEffectType', file: 'Cards/Card.cs' }, // nested inside the Card class
];

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/\/\/[^\n]*/g, '');      // line comments (incl. /// doc comments)
}

/** Extract the `{ ... }` body of `enum <name>` from a source file. */
function extractEnumBody(source: string, enumName: string, file: string): string {
  const match = stripComments(source).match(new RegExp(`enum\\s+${enumName}\\s*\\{([\\s\\S]*?)\\}`));
  if (!match) {
    console.error(`ERROR: enum ${enumName} not found in ${file}`);
    process.exit(1);
  }
  return match[1];
}

/** Parse member names from an enum body (works for both C# and TS enums). */
function parseMemberNames(body: string): string[] {
  return body
    .split(',')
    .map((entry) => {
      const m = entry.match(/^\s*([A-Za-z_]\w*)/); // identifier before any `= value`
      return m ? m[1] : null;
    })
    .filter((name): name is string => name !== null);
}

function readEnum(filePath: string, enumName: string): string[] {
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: file not found: ${filePath}`);
    console.error('Set UNITY_SRC to the Unity Assets/Scripts directory.');
    process.exit(1);
  }
  const source = fs.readFileSync(filePath, 'utf-8');
  return parseMemberNames(extractEnumBody(source, enumName, filePath));
}

let mismatches = 0;
const summary: string[] = [];

for (const { name, file } of ENUM_SOURCES) {
  const csMembers = readEnum(path.join(UNITY_SRC, file), name);
  const tsMembers = readEnum(TS_ENUMS_FILE, name);

  const csSet = new Set(csMembers);
  const tsSet = new Set(tsMembers);
  const missingInTs = csMembers.filter((m) => !tsSet.has(m));
  const missingInCs = tsMembers.filter((m) => !csSet.has(m));

  if (missingInTs.length === 0 && missingInCs.length === 0) {
    summary.push(`  OK  ${name} (${csMembers.length} members)`);
  } else {
    mismatches++;
    console.error(`MISMATCH: ${name}`);
    console.error(`  C# source: ${file} (${csMembers.length} members)`);
    console.error(`  TS source: shared/enums.ts (${tsMembers.length} members)`);
    if (missingInTs.length > 0) console.error(`  Missing in TS:  ${missingInTs.join(', ')}`);
    if (missingInCs.length > 0) console.error(`  Missing in C#:  ${missingInCs.join(', ')}`);
    console.error('');
  }
}

if (mismatches > 0) {
  console.error(`Enum parity check FAILED: ${mismatches}/${ENUM_SOURCES.length} enums out of sync.`);
  process.exit(1);
}

console.log(`Enum parity check passed: ${ENUM_SOURCES.length}/${ENUM_SOURCES.length} enums in sync.`);
console.log(summary.join('\n'));
console.log(`  Unity source: ${UNITY_SRC}`);
