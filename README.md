# get-json-type

[English](./README.en.md) | 简体中文

一款将 JSON 数据转换为 TypeScript 类型定义的 CLI 工具。

## 功能

- 支持多种数据源：URL、本地文件、剪贴板
- 自动检测可选属性
- 智能合并数组中的对象类型
- 支持嵌套对象提取
- 支持 Union 类型
- 交互式命令行界面
- 可作为 npm 包导入使用

## 安装

```bash
bun add json2ts-type
```

## 使用方式

### CLI 命令行

#### 从 URL 获取

```bash
# 基础用法
get-json-type url https://api.example.com/data

# 使用 Bearer 认证
get-json-type url https://api.example.com/data -b your-token

# 指定类型名称和输出文件
get-json-type url https://api.example.com/data -n ApiResponse -o types/api.ts
```

#### 从文件读取

```bash
# 相对路径
get-json-type file ./data.json

# 绝对路径
get-json-type file /path/to/data.json -n MyType -o types/my-type.ts
```

#### 从剪贴板读取

```bash
get-json-type clipboard -n ClipboardData -o types/clipboard.ts
```

#### 交互式模式

```bash
# 直接运行命令，无需参数
get-json-type

# 或使用 bun dev
bun dev
```

### 作为库使用

```typescript
import { parseJsonToType } from 'json2ts-type';

const jsonData = {
  id: 1,
  name: 'John',
  tags: ['admin', 'user']
};

const result = parseJsonToType(jsonData, 'User');
console.log(result.code);
```

输出：

```typescript
export interface User {
  id: number;
  name: string;
  tags: string[];
}
```

## 命令选项

### url 命令

```
get-json-type url <source> [options]
```

| 选项 | 简写 | 说明 |
|------|------|------|
| `--bearer <token>` | `-b` | Bearer 认证令牌 |
| `--name <name>` | `-n` | 生成的类型名称（默认：RootType） |
| `--output <file>` | `-o` | 输出文件路径 |

### file 命令

```
get-json-type file <source> [options]
```

| 选项 | 简写 | 说明 |
|------|------|------|
| `--name <name>` | `-n` | 生成的类型名称（默认：RootType） |
| `--output <file>` | `-o` | 输出文件路径 |

### clipboard 命令

```
get-json-type clipboard [options]
```

| 选项 | 简写 | 说明 |
|------|------|------|
| `--name <name>` | `-n` | 生成的类型名称（默认：RootType） |
| `--output <file>` | `-o` | 输出文件路径 |

## 功能示例

### 可选属性检测

输入 JSON：

```json
{
  "users": [
    { "id": 1, "name": "Alice", "email": "alice@example.com" },
    { "id": 2, "name": "Bob" }
  ]
}
```

生成类型：

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

### Union 类型支持

输入 JSON：

```json
{
  "items": [1, "text", 42, "hello"]
}
```

生成类型：

```typescript
export interface RootType {
  items: (number | string)[];
}
```

### 嵌套对象提取

输入 JSON：

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

生成类型：

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
