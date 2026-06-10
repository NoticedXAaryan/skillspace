import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as tar from 'tar';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create system user
  const hashedPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { username: 'skillspace-team' },
    update: {},
    create: {
      username: 'skillspace-team',
      email: 'team@skillspace.dev',
      passwordHash: hashedPassword,
      verified: true,
      plan: 'enterprise',
    },
  });

  const skills = [
    { name: 'security-reviewer', desc: 'Analyzes code for common OWASP vulnerabilities.' },
    { name: 'pr-summarizer', desc: 'Generates concise pull request summaries.' },
    { name: 'doc-generator', desc: 'Writes comprehensive JSDoc and Markdown documentation.' },
    { name: 'test-writer', desc: 'Generates Vitest/Jest unit tests for given functions.' },
    { name: 'sql-optimizer', desc: 'Optimizes SQL queries and suggests indexes.' },
    { name: 'css-to-tailwind', desc: 'Converts vanilla CSS to Tailwind utility classes.' },
    { name: 'regex-builder', desc: 'Builds and explains complex regular expressions.' },
    { name: 'commit-lint', desc: 'Lints commit messages against Conventional Commits.' },
    { name: 'i18n-translator', desc: 'Translates JSON locale files maintaining keys.' },
    { name: 'bash-explainer', desc: 'Explains what complex bash commands do step by step.' },
  ];

  for (const s of skills) {
    const pkg = await prisma.package.upsert({
      where: { name: s.name },
      update: {},
      create: {
        name: s.name,
        type: 'skill',
        description: s.desc,
        tags: '["tool", "productivity"]',
        ownerId: user.id,
      },
    });

    const manifestStr = JSON.stringify({
      name: s.name,
      version: '1.0.0',
      description: s.desc,
      author: user.username,
      license: 'MIT',
      instructions: {
        system: `You are an expert at ${s.name}.`,
        user_template: `{{input}}`,
        output_format: 'text'
      },
      tags: ['tool'],
      category: 'other',
      permissions: []
    });

    const tempDir = path.join(process.cwd(), '.temp_seed_skill');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'skill.yaml'), manifestStr);
    
    const outPath = path.join(process.cwd(), '.temp_seed_skill.tar.gz');
    await tar.c({ gzip: true, file: outPath, C: tempDir }, ['.']);
    const tarBuffer = fs.readFileSync(outPath);
    
    const storageDir = path.join(process.cwd(), '.storage');
    if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
    fs.writeFileSync(path.join(storageDir, `${s.name}-1.0.0.skillpkg`), tarBuffer);

    await prisma.packageVersion.upsert({
      where: { packageId_version: { packageId: pkg.id, version: '1.0.0' } },
      update: {},
      create: {
        packageId: pkg.id,
        version: '1.0.0',
        manifest: manifestStr,
        storagePath: `packages/${s.name}/1.0.0.skillpkg`,
        checksum: `sha256:${crypto.createHash('sha256').update(tarBuffer).digest('hex')}`,
      },
    });
    console.log(`Seeded package: ${s.name}@1.0.0`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
