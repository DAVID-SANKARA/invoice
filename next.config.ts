import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  compiler: {
    reactRemoveProperties: true, // Peut éviter certains problèmes en dev
  },
  experimental: {
    //appDir: false, // Si tu n'utilises pas le dossier "app", essaye de le désactiver
  }
};

export default nextConfig;
