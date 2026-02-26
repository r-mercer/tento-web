import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          const [, modulePath = ''] = id.split('node_modules/')
          const segments = modulePath.split('/')
          const packageName = segments[0]?.startsWith('@')
            ? `${segments[0]}/${segments[1]}`
            : segments[0]

          if (
            id.includes('monaco-editor') ||
            id.includes('@monaco-editor') ||
            id.includes('@codingame/monaco-vscode')
          ) {
            return 'monaco-vendor'
          }

          if (
            id.includes('graphiql') ||
            id.includes('@graphiql') ||
            id.includes('graphql-language-service') ||
            id.includes('codemirror') ||
            id.includes('@codemirror')
          ) {
            return 'graphiql-vendor'
          }

          if (packageName === 'graphql') {
            return 'graphql-core-vendor'
          }

          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor'
          }

          if (
            id.includes('@fluentui') ||
            id.includes('@griffel') ||
            id.includes('@floating-ui')
          ) {
            return 'fluent-vendor'
          }

          if (id.includes('@tanstack')) {
            return 'query-vendor'
          }

          if (
            packageName === 'xstate' ||
            packageName === '@xstate/react' ||
            packageName === '@xstate/fsm'
          ) {
            return 'state-vendor'
          }

          if (packageName) {
            return `vendor-${packageName.replace('@', '').replace('/', '-')}`
          }

          return 'vendor'
        },
      },
    },
  },
})
