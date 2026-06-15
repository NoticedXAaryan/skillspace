import { Command } from 'commander';
import { loadLinkData } from './link.js';
import { getRegistryUrl } from '@skillspace/runtime';
import chalk from 'chalk';
import { EventSource } from 'eventsource';
import { exec } from 'child_process';

export const registerListenCommand = (program: Command) => {
  const listenCommand = new Command('listen')
    .description('Listen for remote commands from the web dashboard')
    .action(async () => {
      const linkData = loadLinkData();
      if (!linkData) {
        console.error(chalk.red('✗ No linked project found. Run `skillspace link` first.'));
        process.exit(1);
      }

      console.log(chalk.cyan(`◇ Listening for remote commands for project: ${linkData.projectId}`));
      console.log(chalk.gray('  Press Ctrl+C to stop listening\n'));

      const baseUrl = getRegistryUrl();
      const url = `${baseUrl}/api/stream/cli?projectId=${linkData.projectId}`;

      const es = new EventSource(url);

      es.addEventListener('connected', () => {
        console.log(chalk.green('✓ Connected to SkillSpace Registry. Waiting for commands...'));
      });

      es.addEventListener('command', (e: any) => {
        try {
          const data = JSON.parse(e.data);
          console.log(chalk.yellow(`\n⚡ Remote command received: ${data.command}`));
          
          if (data.command.startsWith('skillspace ')) {
            console.log(chalk.gray(`  Executing: ${data.command}`));
            const child = exec(data.command);
            
            child.stdout?.on('data', (chunk) => process.stdout.write(chunk));
            child.stderr?.on('data', (chunk) => process.stderr.write(chalk.red(chunk)));
            
            child.on('close', (code) => {
              if (code === 0) {
                console.log(chalk.green(`\n✓ Command completed successfully.\n`));
              } else {
                console.log(chalk.red(`\n✗ Command failed with code ${code}.\n`));
              }
              console.log(chalk.green('✓ Waiting for next command...'));
            });
          } else {
            console.log(chalk.red('✗ Blocked unauthorized command (only skillspace commands are allowed).'));
          }
        } catch (err: any) {
          console.error(chalk.red(`✗ Failed to process remote command: ${err.message}`));
        }
      });

      es.addEventListener('error', () => {
        // EventSource automatically reconnects
      });
    });

  program.addCommand(listenCommand);
};
