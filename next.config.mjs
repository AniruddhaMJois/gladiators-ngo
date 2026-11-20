/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['firebase-admin', '@google/generative-ai', 'nodemailer'],
  experimental: {
    agentUpgrade: 'security',
  },
};

export default nextConfig;
