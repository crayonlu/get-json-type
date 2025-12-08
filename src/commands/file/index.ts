import * as p from '@clack/prompts';
import pc from 'picocolors';
import { type FileCommandOptions } from '@/types/file';
import { readJsonFromFile } from '@/core/features/file/read-json-from-file';
import { generateTypeFromJson } from '@/core/features/common/generate-type';
import { isValidTypeName } from '@/utils/regex-utils';
export async function fileCommand(source: string, options: FileCommandOptions) {
  p.intro(pc.bgCyan(pc.black(' get-json-type ')));

  let typeName = options.name || 'RootType';
  if (!options.name) {
    const name = await p.text({
      message: 'Enter type name:',
      placeholder: 'RootType',
      initialValue: 'RootType',
      validate: (value) => {
        if (!value) return 'Type name is required';
        if (!isValidTypeName(value))
          return 'Type name must start with uppercase letter and contain only alphanumeric characters';
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
  s.start('Reading JSON from file');
  try {
    const jsonData = await readJsonFromFile(source);
    s.stop('JSON file read successfully');

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
    s.stop('Failed to read or parse JSON file');
    p.cancel(pc.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}
