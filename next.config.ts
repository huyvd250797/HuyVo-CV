import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ['@react-pdf/renderer','sharp'],
  outputFileTracingIncludes: { '/api/media/[...path]': ['./public/*.{png,jpg,jpeg,webp}'], '/api/cv/pdf': ['./public/fonts/pdf/**/*','./public/*.{png,jpg,jpeg,webp}'], '/api/share/image': ['./public/fonts/pdf/**/*','./public/*.{png,jpg,jpeg,webp}'] },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ] }];
  },
};
export default config;
