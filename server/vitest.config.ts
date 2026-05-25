import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['__tests__/setup.ts'],
    // Integration tests are excluded from the default run unless REDIS_URL is explicitly set
    exclude: [
      '**/node_modules/**',
      ...(process.env.REDIS_URL ? [] : ['**/*.integration.test.ts']),
    ],
  },
});
