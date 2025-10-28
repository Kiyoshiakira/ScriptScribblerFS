import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // This is required for react-speech-recognition to work.
    // See: https://github.com/JamesBrill/react-speech-recognition/issues/287
    const originalEntry = config.entry;
    config.entry = async () => {
      const entries = await originalEntry();
      
      if (entries['main-app'] && !entries['main-app'].includes('regenerator-runtime/runtime.js')) {
        entries['main-app'].unshift('regenerator-runtime/runtime.js');
      }

      if (entries['main-app'] && !isServer) {
        if (Array.isArray(entries['main-app']) && !entries['main-app'].includes('regenerator-runtime/runtime.js')) {
            entries['main-app'].unshift('regenerator-runtime/runtime.js');
        } else if (typeof entries['main-app'] === 'string' && !entries['main-app'].includes('regenerator-runtime/runtime.js')) {
            entries['main-app'] = ['regenerator-runtime/runtime.js', entries['main-app']];
        }
      }
      
      return entries;
    };
    
    return config;
  },
};

export default nextConfig;
