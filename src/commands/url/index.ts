import * as p from '@clack/prompts';
import pc from 'picocolors';
import { type UrlCommandOptions } from '@/types/url';
import getJsonFromUrl from '@/core/features/url/get-json-from-url';
import { generateTypeFromJson } from '@/core/features/common/generate-type';
import { isValidTypeName } from '@/utils/regex-utils';
export async function urlCommand(source: string, options: UrlCommandOptions) {
  p.intro(pc.bgCyan(pc.black(' get-json-type ')));
  let bearer = options.bearer;
  if (!bearer) {
    const needAuth = await p.confirm({
      message: 'Does this URL require authentication?',
      initialValue: false,
    });
    if (p.isCancel(needAuth)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }
    if (needAuth) {
      const token = await p.text({
        message: 'Enter Bearer token:',
        placeholder: 'your-token-here',
        validate: (value) => {
          if (!value) return 'Bearer token is required';
        },
      });
      if (p.isCancel(token)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }
      bearer = token as string;
    }
  }
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
  s.start('Fetching JSON from URL');
  const jsonData = await getJsonFromUrl(source, bearer);
  s.stop('JSON fetched successfully');

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
}
