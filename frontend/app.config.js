module.exports = ({ config }) => {
  return {
    ...config,
    name: process.env.COMPANY_NAME || 'Vega Operasyon',
    slug: 'vega-operasyon',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'vegaoperasyon',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-image.png',
      resizeMode: 'contain',
      backgroundColor: '#0F172A',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.BUNDLE_ID || 'com.vegarent.operation',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#0F172A',
      },
      package: process.env.PACKAGE_NAME || 'com.vegarent.operation',
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-web-browser',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-image.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#0F172A',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'Araç fotoğrafları çekmek için kamera izni gereklidir.',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Araç konumlarını görmek için konum izni gereklidir.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'Fotoğraf seçmek için galeri izni gereklidir.',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      API_URL: process.env.API_URL || 'https://car-rental-staff.preview.emergentagent.com/api',
      COMPANY_NAME: process.env.COMPANY_NAME || 'Vega Operasyon',
      eas: {
        projectId: 'af4db31d-9d07-4872-9649-6743df13ba1e',
      },
    },
    owner: 'emrenasir',
  };
};
