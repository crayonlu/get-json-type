import { cac } from 'cac';
import pc from 'picocolors';
import { version } from '../package.json';
import { urlCommand } from '@/commands/url';
import { fileCommand } from '@/commands/file';
import { clipboardCommand } from '@/commands/clipboard';
import { interactiveMode } from '@/commands/interactive';

export function createCLI() {
  const cli = cac('get-json-type');

  cli
    .command('url <source>', 'Generate TS type from JSON source')
    .option('-b, --bearer <auth>', 'Authorization header value for fetching the JSON')
    .option('-o, --output <file>', 'Output file path')
    .option('-n, --name <name>', 'Type name for the generated TypeScript type', {
      default: 'RootType',
    })
    .action(urlCommand);

  cli
    .command('file <source>', 'Generate TS type from JSON file')
    .option('-o, --output <file>', 'Output file path')
    .option('-n, --name <name>', 'Type name for the generated TypeScript type', {
      default: 'RootType',
    })
    .action(fileCommand);

  cli
    .command('clipboard', 'Generate TS type from clipboard JSON')
    .option('-o, --output <file>', 'Output file path')
    .option('-n, --name <name>', 'Type name for the generated TypeScript type', {
      default: 'RootType',
    })
    .action(clipboardCommand);

  cli.help();
  cli.version(version);

  return cli;
}

export function runCLI() {
  const cli = createCLI();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    interactiveMode();
  } else {
    try {
      cli.parse();
    } catch (error) {
      console.error(pc.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }
}

export { urlCommand, fileCommand, clipboardCommand, interactiveMode };
export { default as parseJsonToType } from '@/core/common';
