import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig({
  base:
    process.env.NODE_ENV === 'production' ? '/p2101_klappbruecke/' : '/',
  plugins: [
    eslintPlugin({
      cache: false,
      failOnError: false
    }),
  ],
  assetsInclude: ['**/*.mp3', '**/*.jpeg', '**/*.png', '**/*.task'],
});
