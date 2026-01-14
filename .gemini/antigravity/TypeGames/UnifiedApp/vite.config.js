import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    base: './',
    server: {
        proxy: {
            '/socket.io': {
                target: 'http://localhost:3000',
                ws: true
            },
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    }
})
