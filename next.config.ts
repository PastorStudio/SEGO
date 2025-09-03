
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.boringavatars.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
        "*.cloudworkstations.dev",
        "*.firebase.studio"
    ]
  }

export default nextConfig;
// En next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'picsum.photos', // Añadido para los avatares
      port: '',
      pathname: '/**',
    },
    // ... otros patterns
  ],
},
