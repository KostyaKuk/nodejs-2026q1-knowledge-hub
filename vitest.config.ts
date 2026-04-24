import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],  
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'test/**',                      
      '**/*.e2e-spec.ts',               
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'prisma/',
        'test/',
        '**/*.module.ts',
        '**/*.controller.ts',
        '**/main.ts',
        '**/*.dto.ts',
        '**/*.entity.ts',
        '**/*.interface.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});