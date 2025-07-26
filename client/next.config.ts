import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL(
        "https://cdn.prod.website-files.com/624af442a8151d5a2ef5644c/6411ae2da44e40ce2a5f7689_chat_hero-p-1080.png"
      ),
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path",
        destination: "http://localhost:5000/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
