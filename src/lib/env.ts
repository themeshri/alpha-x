import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  APIFY_API_TOKEN: z.string().min(1, 'APIFY_API_TOKEN is required'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  SCRAPE_INTERVAL_MINUTES: z.string().default('30'),
}).refine(
  (data) => data.OPENAI_API_KEY || data.ANTHROPIC_API_KEY,
  {
    message: 'Either OPENAI_API_KEY or ANTHROPIC_API_KEY must be set',
    path: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  }
);

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    const validated = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('❌ Error validating environment:', error);
    }
    process.exit(1);
  }
}
