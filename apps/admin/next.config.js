/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@shuttle/database", "@shuttle/shared-types"],
  reactStrictMode: true,
};

module.exports = nextConfig;
