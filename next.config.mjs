/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Cloudflare Pages
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Trailing slashes configuration
  trailingSlash: false,

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize CSS
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
