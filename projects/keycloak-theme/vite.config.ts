/// <reference types="vitest" />

import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { keycloakify } from 'keycloakify/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2022'],
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    tailwindcss(),
    angular(),
    keycloakify({
      accountThemeImplementation: 'none',
    }),
  ],
}));
