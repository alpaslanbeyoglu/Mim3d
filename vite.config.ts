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
//...
