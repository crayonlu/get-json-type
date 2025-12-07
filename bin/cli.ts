#!/usr/bin/env bun
import { cac } from 'cac';
import pc from 'picocolors';
import { version } from '../package.json';
import { urlCommand } from '@/commands/url';
import { interactiveMode } from '@/commands/interactive';
const cli = cac('get-json-type');
cli
  .command('url <source>', 'Generate TS type from JSON source')
  .option('-b, --bearer <auth>', 'Authorization header value for fetching the JSON')
  .option('-o, --output <file>', 'Output file path')
  .option('-n, --name <name>', 'Type name for the generated TypeScript type', {
    default: 'RootType',
  })
  .action(urlCommand);
cli.help();
cli.version(version);
const args = process.argv.slice(2);
if (args.length === 0) {
  (async () => {
    const result = await interactiveMode();
    process.argv = ['bun', 'cli.ts', result.command, result.source];
    cli.parse();
  })();
} else {
  try {
    cli.parse();
  } catch (error) {
    console.error(pc.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}
