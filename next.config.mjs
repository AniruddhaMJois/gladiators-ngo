/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['firebase-admin', '@google/generative-ai', 'nodemailer'],
};

export default nextConfig;
