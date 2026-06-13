import type { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { RegistryClient } from '../utils/api.js';
import { intro } from '../ui/states/intro.js';
import { outro } from '../ui/states/outro.js';
import { successStandard } from '../ui/states/success.js';
import { errorOperational } from '../ui/states/error.js';
import { createLoader } from '../ui/states/loader.js';
import { c } from '../ui/tokens/colors.js';
import { box } from '../ui/layout/box.js';
import { padLabel } from '../ui/layout/utils.js';

const LINK_FILE = '.skillspace-link.json';

interface LinkData {
  projectId: string;
  projectName: string;
  linkedAt: string;
  deviceFingerprint: string;
}

function getDeviceFingerprint(): string {
  const data = [
    os.platform(),
    os.arch(),
    os.hostname(),
    os.cpus()[0]?.model || 'unknown_cpu',
  ].join('|');
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

function loadLinkData(): LinkData | null {
  const linkPath = path.join(process.cwd(), LINK_FILE);
  if (!fs.existsSync(linkPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(linkPath, 'utf-8'));
  } catch {
    return null;
  }
}

function saveLinkData(data: LinkData): void {
  const linkPath = path.join(process.cwd(), LINK_FILE);
  fs.writeFileSync(linkPath, JSON.stringify(data, null, 2));
}

function removeLinkData(): void {
  const linkPath = path.join(process.cwd(), LINK_FILE);
  if (fs.existsSync(linkPath)) fs.unlinkSync(linkPath);
}

export function registerLinkCommand(program: Command): void {
  program
    .command('link')
    .description('Link local project to a SkillSpace dashboard project')
    .option('-u, --unlink', 'Unlink the current project')
    .option('-s, --status', 'Show current link status')
    .option('-y, --yes', 'Headless mode')
    .action(async (opts) => {
      intro('link', 'Project Linking');

      // Status check
      if (opts.status) {
        const linkData = loadLinkData();
        if (!linkData) {
          console.log(box([
            `${c.textFaint('No project linked.')}`,
            ``,
            `Run ${c.code('skillspace link')} to link this directory to a dashboard project.`,
          ], { title: 'Link Status', colorFn: c.warning }));
          outro(0);
          return;
        }

        console.log(box([
          padLabel('Project') + c.brand(linkData.projectName),
          padLabel('ID') + c.code(linkData.projectId),
          padLabel('Linked') + new Date(linkData.linkedAt).toLocaleString(),
          padLabel('Device') + c.code(linkData.deviceFingerprint),
        ], { title: 'Link Status' }));
        outro(0);
        return;
      }

      // Unlink
      if (opts.unlink) {
        const linkData = loadLinkData();
        if (!linkData) {
          errorOperational('Not linked', { message: 'This project is not linked to any dashboard project.' });
          process.exit(1);
        }
        removeLinkData();
        successStandard('Project unlinked', { detail: `Removed link to ${linkData.projectName}.` });
        outro(0);
        return;
      }

      // Link
      const existingLink = loadLinkData();
      if (existingLink) {
        console.log(box([
          `This project is already linked to ${c.brand(existingLink.projectName)}.`,
          ``,
          `Run ${c.code('skillspace link --unlink')} to remove the existing link first.`,
        ], { title: 'Already Linked', colorFn: c.warning }));
        outro(0);
        return;
      }

      const loader = !opts.yes ? createLoader('Connecting to registry...') : null;

      try {
        const client = new RegistryClient();
        const meResult = await client.me();

        if (meResult.error) {
          loader?.fail('Not authenticated');
          errorOperational('Authentication required', {
            message: 'Run `skillspace login` first to link your project.',
          });
          process.exit(1);
        }

        loader?.succeed('Authenticated');

        const dirName = path.basename(process.cwd());
        const fingerprint = getDeviceFingerprint();
        const projectId = crypto.createHash('sha256').update(`${dirName}-${fingerprint}`).digest('hex').substring(0, 12);

        const linkData: LinkData = {
          projectId,
          projectName: dirName,
          linkedAt: new Date().toISOString(),
          deviceFingerprint: fingerprint,
        };

        saveLinkData(linkData);

        console.log(box([
          padLabel('Project') + c.brand(dirName),
          padLabel('ID') + c.code(projectId),
          padLabel('Device') + c.code(fingerprint),
        ], { title: 'Link Details' }));

        successStandard('Project linked', {
          detail: 'This directory is now linked to your dashboard.',
          hint: 'Run `skillspace run` to stream sessions to the dashboard',
        });

      } catch (err: any) {
        loader?.fail('Link failed');
        errorOperational('Link failed', { message: err.message });
        process.exit(1);
      }

      outro(0);
    });
}

export function registerDashboardCommand(program: Command): void {
  program
    .command('dashboard')
    .description('Open the SkillSpace dashboard in your browser')
    .option('-p, --page <page>', 'Specific dashboard page to open', 'dashboard')
    .action(async (opts) => {
      const { getRegistryUrl } = await import('@skillspace/runtime');
      const baseUrl = getRegistryUrl();

      const linkData = loadLinkData();
      let url = `${baseUrl}/dashboard`;

      if (opts.page && opts.page !== 'dashboard') {
        url = `${baseUrl}/dashboard/${opts.page}`;
      }

      if (linkData && opts.page === 'dashboard') {
        url = `${baseUrl}/dashboard/activity`;
      }

      try {
        const { execSync } = await import('child_process');
        const platform = process.platform;

        if (platform === 'darwin') {
          execSync(`open "${url}"`);
        } else if (platform === 'win32') {
          execSync(`start "" "${url}"`);
        } else {
          execSync(`xdg-open "${url}"`);
        }

        successStandard('Dashboard opened', { url });
      } catch {
        console.log(`\n  Open this URL in your browser:\n\n  ${c.brand(url)}\n`);
      }
    });
}
