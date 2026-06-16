# ts-mini-agent CLI

基于 React + Ink 的简单 CLI 对话工具。

## Development

- Install dependencies:

```bash
pnpm install
```

- Run the unit tests:

```bash
pnpm run test
```

- Build the CLI:

```bash
pnpm --filter ./agent-cli build
```

## Run

开发模式：

```bash
pnpm --filter ./agent-cli dev
```

或构建后运行：

```bash
pnpm --filter ./agent-cli start
# 或者
node ./agent-cli/dist/index.mjs
```

使用：在命令行中输入文本并回车，将在控制台打印 `Received:` 前缀。将 `src/index.ts` 中的 `handleInput` 接入你的 agent 逻辑即可。
