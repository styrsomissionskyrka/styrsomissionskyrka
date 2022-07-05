import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
	platform: 'browser',
	format: 'iife',
	entry: ['src/admin.ts'],
	outDir: 'dist',
	splitting: false,
	sourcemap: true,
	clean: true,
	minify: !options.watch,
	external: ['react', 'react-dom', 'lodash', /^@wordpress\/.+$/],
	env: {
		NODE_ENV: options.watch ? 'development' : 'production',
	},
}));
