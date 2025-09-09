const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.boringavatars.com',
        port: '',
        pathname: '/**',},
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',},
    ],
  },
  
};

module.exports = nextConfig;