import { spawnSync, type SpawnSyncReturns } from 'node:child_process';

export function runPnpm(args: readonly string[], cwd: string): SpawnSyncReturns<string> {
  const windows = process.platform === 'win32';
  const quote = (value: string): string => `'${value.replaceAll("'", "''")}'`;
  return spawnSync(windows ? 'pwsh' : 'pnpm', windows
    ? ['-NoProfile', '-NonInteractive', '-Command', `& pnpm ${args.map(quote).join(' ')}; exit $LASTEXITCODE`]
    : args, { cwd, encoding: 'utf8' });
}
