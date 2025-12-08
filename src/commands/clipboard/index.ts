import * as p from '@clack/prompts';
import pc from 'picocolors';
import { type ClipboardCommandOptions } from '@/types/clipboard';
import { readJsonFromClipboard } from '@/core/features/clipboard/read-json-from-clipboard';
import { generateTypeFromJson } from '@/core/features/common/generate-type';

export async function clipboardCommand(options: ClipboardCommandOptions) {
  p.intro(pc.bgCyan(pc.black(' get-json-type ')));

  let typeName = options.name || 'RootType';
  if (!options.name) {
    const name = await p.text({
      message: 'Enter type name:',
      placeholder: 'RootType',
      initialValue: 'RootType',
      validate: (value) => {
        if (!value) return 'Type name is required';
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
          return 'Type name must start with uppercase letter and contain only alphanumeric characters';
        }
      },
    });
    if (p.isCancel(name)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }
    typeName = name as string;
  }

  let output = options.output;
  if (!output) {
    const shouldOutput = await p.confirm({
      message: 'Save to file?',
      initialValue: false,
    });
    if (p.isCancel(shouldOutput)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }
    if (shouldOutput) {
      const file = await p.text({
        message: 'Enter output file path:',
        placeholder: 'types/api.ts',
        validate: (value) => {
          if (!value) return 'Output path is required';
          if (!value.endsWith('.ts')) return 'Output file must be a .ts file';
        },
      });
      if (p.isCancel(file)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }
      output = file as string;
    }
  }

  const s = p.spinner();
  s.start('Reading JSON from clipboard');
  try {
    const jsonData = await readJsonFromClipboard();
    s.stop('Clipboard content parsed successfully');

    s.start('Generating TypeScript types');
    const result = await generateTypeFromJson(jsonData, {
      typeName,
      outputPath: output,
    });
    s.stop('Type generated successfully');

    if (result.saved) {
      p.note(`File saved to: ${result.outputPath}`, 'Output');
    } else {
      console.log('\n' + pc.bold(pc.cyan('Generated TypeScript Type:')));
      console.log(pc.gray('─'.repeat(50)));
      console.log(result.code);
      console.log(pc.gray('─'.repeat(50)));
    }

    p.outro(pc.green('✓ Type generation complete!'));
  } catch (error) {
    s.stop('Failed to read or parse clipboard content');
    p.cancel(pc.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}
