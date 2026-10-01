/**
 * Architecture rules for Clean Architecture + vertical slices.
 * Run: pnpm depcruise src --config .dependency-cruiser.cjs
 * $1 / $2 refer to capture groups of the "from" path (dependency-cruiser group matching).
 */
module.exports = {
  forbidden: [
    {
      name: 'domain-is-pure',
      comment: 'domain/ must not depend on frameworks, infrastructure or other layers.',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/domain/' },
      to: {
        path: [
          '^src/modules/[^/]+/(features|infrastructure|ports|public)/',
          '^src/shared/(http|infrastructure)/',
          'node_modules/(@nestjs|kysely|nestjs-zod|pg)/',
        ],
      },
    },
    {
      name: 'ports-are-pure',
      comment: 'ports/ may only depend on domain/ and shared/kernel.',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/ports/' },
      to: {
        path: [
          '^src/modules/[^/]+/(features|infrastructure)/',
          '^src/shared/(http|infrastructure)/',
          'node_modules/(@nestjs|kysely|pg)/',
        ],
      },
    },
    {
      name: 'no-cross-slice-imports',
      comment: 'A slice must never import another slice. Move shared logic to domain/ or a port.',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/features/([^/]+)/' },
      to: { path: '^src/modules/$1/features/', pathNot: '^src/modules/$1/features/$2/' },
    },
    {
      name: 'slices-do-not-import-infrastructure',
      comment: 'Slices depend on ports; the module binds adapters.',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/features/' },
      to: { path: '^src/modules/[^/]+/infrastructure/' },
    },
    {
      name: 'contexts-talk-through-public',
      comment: "Other contexts are reachable only through their public/ folder or module file.",
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/[^/]+/',
        pathNot: ['^src/modules/$1/', '^src/modules/[^/]+/public/', '^src/modules/[^/]+/[^/]+\\.module\\.ts$'],
      },
    },
    {
      name: 'kernel-is-pure',
      severity: 'error',
      from: { path: '^src/shared/kernel/' },
      to: { path: ['^src/modules/', '^src/shared/(http|infrastructure)/', 'node_modules/(@nestjs|kysely|pg)/'] },
    },
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.(spec|e2e-spec)\\.ts$' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require', 'node', 'default'] },
  },
};
