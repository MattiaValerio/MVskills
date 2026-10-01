/**
 * Frontend architecture rules (react-architecture skill).
 * Run: pnpm depcruise src --config .dependency-cruiser.cjs
 * $1 refers to the first capture group of the "from" path (group matching).
 * Requires a TypeScript version supported by dependency-cruiser; a run that reports
 * "0 modules" did not analyse the sources and must be treated as a failure.
 */
module.exports = {
  forbidden: [
    {
      name: 'routes-are-entrypoints',
      comment: 'Only the generated route tree may import route files.',
      severity: 'error',
      from: { pathNot: ['^src/routeTree\\.gen\\.ts$', '^src/routes/'] },
      to: { path: '^src/routes/' },
    },
    {
      name: 'features-are-isolated',
      comment: 'A feature never imports another feature; compose them in a route or share via components/lib.',
      severity: 'error',
      from: { path: '^src/features/([^/]+)/' },
      to: { path: '^src/features/', pathNot: '^src/features/$1/' },
    },
    {
      name: 'shared-is-a-leaf',
      comment: 'components/, lib/ and hooks/ have no business knowledge.',
      severity: 'error',
      from: { path: '^src/(components|lib|hooks)/' },
      to: { path: '^src/(features|routes)/' },
    },
    {
      name: 'api-access-through-feature-api',
      comment: 'Only features/*/api and lib/ may use the API client; UI consumes query/mutation options.',
      severity: 'error',
      from: { path: '^src/', pathNot: ['^src/features/[^/]+/api/', '^src/lib/', '^src/test/'] },
      to: { path: ['^src/lib/api-client\\.ts$', '(^|/)packages/api-client/', 'node_modules/openapi-fetch/'] },
    },
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.(test|spec)\\.tsx?$' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.app.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'types', 'default'],
      extensions: ['.ts', '.tsx', '.js', '.d.ts'],
    },
  },
};
