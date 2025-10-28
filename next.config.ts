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
  // This is required for react-speech-recognition to work with Turbopack.
  // See: https://github.com/JamesBrill/react-speech-recognition/issues/287
  experimental: {
    turbo: {
      dangerouslyAllowModules: [
          'regenerator-runtime'
      ]
    },
  },
  webpack: (config, { isServer }) => {
    // This is required for react-speech-recognition to work.
    // See: https://github.com/JamesBrill/react-speech-recognition/issues/287
    if (!isServer) {
        // Ensures regenerator-runtime is available on the client-side
        config.entry = [
            'regenerator-runtime/runtime.js',
            ...config.entry as string[]
        ];
    }
    return config;
  },
};

export default nextConfig;
