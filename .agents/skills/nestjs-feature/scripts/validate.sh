#!/usr/bin/env bash
# Validation pipeline for a NestJS app following the nestjs-architecture skill.
# Usage: bash validate.sh [app-dir]   (default: current directory)
# Runs every step even if one fails, then prints a summary and exits non-zero on any failure.
set -uo pipefail

APP_DIR="${1:-.}"
cd "$APP_DIR" || { echo "Cannot cd into $APP_DIR"; exit 2; }

has_script() { node -e "process.exit(require('./package.json').scripts?.['$1'] ? 0 : 1)" 2>/dev/null; }

declare -a NAMES=() RESULTS=()

run_step() {
  local name="$1"; shift
  echo -e "\n━━━ $name ━━━"
  if "$@"; then RESULTS+=("PASS"); else RESULTS+=("FAIL"); fi
  NAMES+=("$name")
}

# 1. Types
if has_script typecheck; then run_step "typecheck" pnpm run -s typecheck
else run_step "typecheck" pnpm exec tsc --noEmit -p tsconfig.json; fi

# 2. Lint + format (Biome)
if has_script lint; then run_step "biome" pnpm run -s lint
else run_step "biome" pnpm exec biome check .; fi

# 3. Architecture rules
# dependency-cruiser silently analyses 0 files (and reports success) when it can't load a
# compatible TypeScript (currently < 7). Treat that as a failure, never as a pass.
check_arch() {
  local out
  out="$(pnpm exec depcruise src --config .dependency-cruiser.cjs 2>&1)"; local code=$?
  echo "$out"
  if grep -qE "missing-typescript-transpiler|\(0 modules" <<<"$out"; then
    echo "!! dependency-cruiser did not analyse the TypeScript sources."
    echo "!! Install a supported compiler: pnpm add -D typescript@6"
    return 1
  fi
  return $code
}
if [[ -f .dependency-cruiser.cjs ]]; then
  run_step "architecture" check_arch
else
  echo -e "\n━━━ architecture ━━━\n.dependency-cruiser.cjs missing — copy it from the nestjs-architecture skill assets."
  NAMES+=("architecture"); RESULTS+=("FAIL")
fi

# 4. Tests
if has_script test; then run_step "tests" pnpm run -s test
else run_step "tests" pnpm exec vitest run; fi

echo -e "\n━━━ summary ━━━"
FAILED=0
for i in "${!NAMES[@]}"; do
  printf '%-14s %s\n' "${NAMES[$i]}" "${RESULTS[$i]}"
  [[ "${RESULTS[$i]}" == "FAIL" ]] && FAILED=1
done
exit $FAILED
