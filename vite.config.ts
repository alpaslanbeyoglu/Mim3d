import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  return {
    // GitHub Pages alt dizin ismiyle tam uyumlu
    // NOT: AI Studio önizleme ekranının (404 hatası vermeden) çalışabilmesi için 
    // "command === 'build'" kontrolü ZORUNLUDUR. Bu sayede local'de "/", GitHub'da "/Mim3d/" kullanır.
    base: command === 'build' ? '/Mim3d/' : '/', 
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
      // Büyük dosyaları bölerek build performansını ve yükleme hızını artırır
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'three', 'motion'],
          },
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
