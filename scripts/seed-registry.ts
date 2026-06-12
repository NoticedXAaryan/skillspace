/**
 * Seed the registry database with example skills from the examples/ directory.
 * Run with: npx tsx scripts/seed-registry.ts
 *
 * Requires DATABASE_URL environment variable to be set.
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const EXAMPLES_DIR = path.join(__dirname, '..', 'examples');

interface SkillData {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  tags: string[];
  persona: {
    system_prompt: string;
    behavioral_guidelines: string[];
    capabilities: string[];
  };
}

function parseYamlSimple(content: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = content.split('\n');
  let currentKey = '';
  let inMultiline = false;
  let multilineContent = '';
  let indent = 0;

  for (const line of lines) {
    const trimmed = line.trimStart();
    const currentIndent = line.length - trimmed.length;

    if (inMultiline) {
      if (currentIndent > indent || trimmed === '') {
        multilineContent += (multilineContent ? '\n' : '') + trimmed;
        continue;
      } else {
        result[currentKey] = multilineContent;
        inMultiline = false;
        multilineContent = '';
      }
    }

    if (trimmed.startsWith('#') || trimmed === '') continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    if (value === '|' || value === '>-') {
      currentKey = key;
      inMultiline = true;
      indent = currentIndent + 2;
      multilineContent = '';
      continue;
    }

    if (value === '' || value === '[]') {
      result[key] = [];
      continue;
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      result[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      continue;
    }

    if (value.startsWith('"') || value.startsWith("'")) {
      result[key] = value.slice(1, -1);
    } else if (value === 'true') {
      result[key] = true;
    } else if (value === 'false') {
      result[key] = false;
    } else if (!isNaN(Number(value))) {
      result[key] = Number(value);
    } else {
      result[key] = value;
    }
  }

  if (inMultiline) {
    result[currentKey] = multilineContent;
  }

  return result;
}

async function main() {
  console.log('Seeding registry with example skills...\n');

  // Ensure a default user exists
  let user = await prisma.user.findFirst({ where: { email: 'admin@skillspace.dev' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'SkillSpace',
        email: 'admin@skillspace.dev',
        username: 'skillspace',
        emailVerified: true,
      },
    });
    console.log('Created default user: skillspace');
  }

  const dirs = fs.readdirSync(EXAMPLES_DIR).filter(d => {
    const skillPath = path.join(EXAMPLES_DIR, d, 'skill.yaml');
    return fs.existsSync(skillPath);
  });

  let created = 0;
  let skipped = 0;

  for (const dir of dirs) {
    const skillPath = path.join(EXAMPLES_DIR, dir, 'skill.yaml');
    const content = fs.readFileSync(skillPath, 'utf-8');
    const data = parseYamlSimple(content);

    const name = data.name || `@skillspace/${dir}`;
    const version = String(data.version || '1.0.0');

    // Check if already exists
    const existing = await prisma.package.findUnique({ where: { name } });
    if (existing) {
      console.log(`  SKIP (exists): ${name}`);
      skipped++;
      continue;
    }

    // Create package
    const pkg = await prisma.package.create({
      data: {
        name,
        type: 'skill',
        ownerId: user.id,
        description: data.description || `A skill for ${dir}`,
        tags: JSON.stringify(data.tags || []),
        downloads: Math.floor(Math.random() * 1000) + 100,
      },
    });

    // Create version
    await prisma.packageVersion.create({
      data: {
        packageId: pkg.id,
        version,
        manifest: JSON.stringify(data),
        storagePath: `examples/${dir}/skill.yaml`,
        checksum: `sha256:${Buffer.from(content).toString('base64').slice(0, 64)}`,
        size: Buffer.byteLength(content),
      },
    });

    console.log(`  CREATED: ${name}@${version}`);
    created++;
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
