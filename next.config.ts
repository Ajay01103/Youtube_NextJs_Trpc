import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
      {
        protocol: "https",
        hostname: "0huv1d38xh.ufs.sh",
      },
    ],
  },
}

export default nextConfig
