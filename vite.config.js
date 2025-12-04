import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

import { configDefaults } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  // This is needed for deploying to GitHub pages where we might
  // not be deployed at the root
  base: './',
  build: {
    rollupOptions: {
    },
    // This means we don't have to change the config in cloudflare.
    outDir: 'build'
  },
  server: {
    https: true,
    port: 3000,

  },
  plugins: [
    mkcert({
      keyFileName: "./localhost-key.pem",
      certFileName: "./localhost.pem",
    }),
    react(),
    process.env.CI !== "true" && mkcert(),
  ],
  // This is to get rid of errors with Instructure UI which depend on process.env
  define: {
    'process.env': {}
  },
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "deployment/*"],
  },
})