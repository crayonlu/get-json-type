# get-json-type

English | [简体中文](./README.md)

A CLI tool to convert JSON data into TypeScript type definitions.

## Features

- Multiple data sources: URL, local file, clipboard
- Automatic optional property detection
- Smart merging of object types in arrays
- Nested object extraction
- Union type support
- Interactive command-line interface
- Available as npm package

## Installation

```bash
bun add json2ts-type
```

## Usage

### CLI Commands

#### From URL

```bash
# Basic usage
get-json-type url https://api.example.com/data

# With Bearer authentication
get-json-type url https://api.example.com/data -b your-token

# Specify type name and output file
get-json-type url https://api.example.com/data -n ApiResponse -o types/api.ts
```

#### From File

```bash
# Relative path
get-json-type file ./data.json

# Absolute path
get-json-type file /path/to/data.json -n MyType -o types/my-type.ts
```

#### From Clipboard

```bash
get-json-type clipboard -n ClipboardData -o types/clipboard.ts
```

#### Interactive Mode

```bash
# Run without arguments
get-json-type

# Or use bun dev
bun dev
```

### As Library

```typescript
import { parseJsonToType } from 'json2ts-type';

const jsonData = {
  id: 1,
  name: 'John',
  tags: ['admin', 'user'],
};

const result = parseJsonToType(jsonData, 'User');
console.log(result.code);
```

Output:

```typescript
export interface User {
  id: number;
  name: string;
  tags: string[];
}
```

## Command Options

### url command

```
get-json-type url <source> [options]
```

| Option             | Alias | Description                             |
| ------------------ | ----- | --------------------------------------- |
| `--bearer <token>` | `-b`  | Bearer authentication token             |
| `--name <name>`    | `-n`  | Generated type name (default: RootType) |
| `--output <file>`  | `-o`  | Output file path                        |

### file command

```
get-json-type file <source> [options]
```

| Option            | Alias | Description                             |
| ----------------- | ----- | --------------------------------------- |
| `--name <name>`   | `-n`  | Generated type name (default: RootType) |
| `--output <file>` | `-o`  | Output file path                        |

### clipboard command

```
get-json-type clipboard [options]
```

| Option            | Alias | Description                             |
| ----------------- | ----- | --------------------------------------- |
| `--name <name>`   | `-n`  | Generated type name (default: RootType) |
| `--output <file>` | `-o`  | Output file path                        |

## Examples

### Optional Property Detection

Input JSON:

```json
{
  "users": [
    { "id": 1, "name": "Alice", "email": "alice@example.com" },
    { "id": 2, "name": "Bob" }
  ]
}
```

Generated types:

```typescript
export interface User {
  id: number;
  name: string;
  email?: string;
}

export interface RootType {
  users: User[];
}
```

### Union Type Support

Input JSON:

```json
{
  "items": [1, "text", 42, "hello"]
}
```

Generated types:

```typescript
export interface RootType {
  items: (number | string)[];
}
```

### Nested Object Extraction

Input JSON:

```json
{
  "user": {
    "profile": {
      "name": "John",
      "age": 30
    }
  }
}
```

Generated types:

```typescript
export interface Profile {
  name: string;
  age: number;
}

export interface User {
  profile: Profile;
}

export interface RootType {
  user: User;
}
```
