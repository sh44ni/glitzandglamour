import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.glitzandglamour.studio',
  appName: 'Glitz & Glamour',
  // Loads the live deployed website — updates to the site reflect instantly in the app
  server: {
    url: 'https://glitzandglamours.com',
    cleartext: false,
  },
  android: {
    backgroundColor: '#0A0A0A',
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0A0A0A',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FF2D78',
    },
  },
};

export default config;
