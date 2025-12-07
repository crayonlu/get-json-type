import * as p from '@clack/prompts';
import pc from 'picocolors';
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
      return { command: 'url', source: url as string };
    }
    case 'file':
    case 'clipboard':
    default:
      p.outro(pc.yellow(`${mode} mode is not implemented yet`));
      process.exit(0);
  }
}
