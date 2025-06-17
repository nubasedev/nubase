import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['schema/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
})
