/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lint runs as a separate release check so production builds stay focused on
  // compilation and type safety. `npm run check` runs both.
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Allow the service worker to control the whole origin.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
    ];
  },
};

export default nextConfig;
