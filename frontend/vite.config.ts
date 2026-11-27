import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

const proxy = { "/api": process.env.FOLIO_API_TARGET ?? "http://localhost:8080" };
export default defineConfig({
  server: { proxy },
  preview: { proxy },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
