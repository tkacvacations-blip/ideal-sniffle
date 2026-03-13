import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Build-time validation
  console.log('\n🔍 Build-time Environment Check:');
  console.log('Mode:', mode);
  console.log('VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? '✓ SET' : '✗ NOT SET');
  console.log('VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? '✓ SET' : '✗ NOT SET');
  console.log('VITE_STRIPE_PUBLISHABLE_KEY:', env.VITE_STRIPE_PUBLISHABLE_KEY ? '✓ SET' : '✗ NOT SET');

  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    console.error('\n❌ ERROR: Required environment variables are missing!');
    console.error('Make sure these are set in Netlify Dashboard under Site settings → Environment variables\n');
  }

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    publicDir: 'public',
    build: {
      copyPublicDir: false,
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js'
        }
      }
    }
  };
});
