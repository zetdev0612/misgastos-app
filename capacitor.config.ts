import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.misgastos.app',
  appName: 'MisGastos',
  webDir: 'www',
  server: {
    cleartext: true,
    androidScheme : 'https'
  }
};

export default config;
