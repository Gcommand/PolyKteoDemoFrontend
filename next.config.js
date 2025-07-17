/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Ensure console logs are visible in production
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // images: {
  //   domains: ["images-na.ssl-images-amazon.com", "polyukteo.10u.org"],
  // },
};

module.exports = nextConfig;
