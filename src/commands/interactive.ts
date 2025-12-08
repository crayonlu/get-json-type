import * as p from '@clack/prompts';
import pc from 'picocolors';
import { urlCommand } from './url';
import { fileCommand } from './file';
import { clipboardCommand } from './clipboard';
import type { UrlCommandOptions } from '@/types/url';
import type { FileCommandOptions } from '@/types/file';
import type { ClipboardCommandOptions } from '@/types/clipboard';

export async function interactiveMode() {
  p.intro(pc.bgCyan(pc.black(' get-json-type ')));
  const mode = await p.select({
    message: 'How would you like to provide JSON?',
    options: [
      { value: 'url', label: 'From URL', hint: 'Fetch JSON from a remote URL' },
      { value: 'file', label: 'From File', hint: 'Read JSON from a local file' },
      { value: 'clipboard', label: 'From Clipboard', hint: 'Parse JSON from clipboard' },
    ],
  });
  if (p.isCancel(mode)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }
  switch (mode) {
    case 'url': {
      const url = await p.text({
        message: 'Enter URL:',
        placeholder: 'https://api.example.com/data',
        validate: (value) => {
          if (!value) return 'URL is required';
          try {
            new URL(value);
          } catch {
            return 'Invalid URL format';
          }
        },
      });
      if (p.isCancel(url)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }
      await urlCommand(url as string, {} as UrlCommandOptions);
      break;
    }
    case 'file': {
      const filePath = await p.text({
        message: 'Enter file path:',
        placeholder: 'data.json',
        validate: (value) => {
          if (!value) return 'File path is required';
        },
      });
      if (p.isCancel(filePath)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }
      await fileCommand(filePath as string, {} as FileCommandOptions);
      break;
    }
    case 'clipboard': {
      await clipboardCommand({} as ClipboardCommandOptions);
      break;
    }
    default:
      p.outro(pc.yellow(`${mode} mode is not implemented yet`));
      process.exit(0);
  }
}
