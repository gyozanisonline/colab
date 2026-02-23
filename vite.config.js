import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SERVER_PORT = parseInt(process.env.PORT || '3000', 10);

export default defineConfig({
    plugins: [react()],
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    base: './',
    server: {
        proxy: {
            '/socket.io': {
                target: `http://localhost:${SERVER_PORT}`,
                ws: true
            },
            '/api': {
                target: `http://localhost:${SERVER_PORT}`,
                changeOrigin: true
            }
        }
    }
})
