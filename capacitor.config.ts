import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'tanstack_start_ts',
  webDir: 'dist',
  server: {
    url: 'http://192.168.1.3:8080',
    cleartext: true
  }
};

export default config;
