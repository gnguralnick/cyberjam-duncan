import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: 'certs/key.pem',
      cert: 'certs/cert.pem'
    },
    host: '0.0.0.0',
    port: 3000
  }
})
