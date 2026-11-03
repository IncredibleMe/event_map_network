import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// "npm run build" παράγει κανονικό build στον φάκελο dist/.
// "npm run build:preview" παράγει ένα μόνο αρχείο HTML (dist-single/) για γρήγορη επίδειξη.
export default defineConfig(({ mode }) => ({
  plugins: mode === 'singlefile' ? [react(), viteSingleFile()] : [react()],
  base: './',
  build: mode === 'singlefile' ? { outDir: 'dist-single' } : {},
}));
