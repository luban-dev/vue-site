import * as path from 'node:path';
import { defineConfig } from 'vite';
import viteLubanPlugin from '@luban-ui/vite-plugin-vue';

const conf = defineConfig(() => {
  const root = __dirname;

  return {
    root,
    server: {
      host: '0.0.0.0',
      port: 5173
    },
    resolve: {
      alias: {
        '@/': path.join(__dirname, './src/')
      }
    },
    plugins: [viteLubanPlugin({
      root,
      envDts: {
        enable: true,
        options: {
          filename: './types-global/custom-env.d.ts',
          name: 'CustomEnv'
        }
      }
      // ...other options
    })],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        }
      }
    }
  };
});

export default conf;
