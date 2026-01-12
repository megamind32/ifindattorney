import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons/**',
      },
    ],
  },

  webpack(config) {
    // Handle SVG imports as React components
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },

  // Add response headers for all routes to allow geolocation
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self), camera=(), microphone=()'
          },
          {
            key: 'Feature-Policy',
            value: 'geolocation "self"'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate, s-maxage=0'
          }
        ]
      }
    ];
  },

  turbopack: {},
};

export default nextConfig;
