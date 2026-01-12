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
      // Critical: Form page must have geolocation headers
      {
        source: '/form',
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
            value: 'no-store, no-cache, must-revalidate, max-age=0'
          }
        ]
      },
      // Fallback for all other routes
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
          }
        ]
      }
    ];
  },

  turbopack: {},
};

export default nextConfig;
