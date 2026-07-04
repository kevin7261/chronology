import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

// base 對應 GitHub Pages 部署路徑：https://kevin7261.github.io/chronology/
export default defineConfig({
  base: '/chronology/',
  plugins: [vue(), tailwindcss()],
});
