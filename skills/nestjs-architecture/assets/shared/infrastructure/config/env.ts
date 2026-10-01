import { z } from 'zod';

// Single source of truth for environment variables. Extend, never read process.env elsewhere.
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
});

export type Env = z.infer<typeof EnvSchema>;

/** Pass to ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }). */
export const validateEnv = (config: Record<string, unknown>): Env => EnvSchema.parse(config);
