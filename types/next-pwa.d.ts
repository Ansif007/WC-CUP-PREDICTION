declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAOptions = {
    dest: string;
    disable?: boolean;
    fallbacks?: {
      document?: string;
    };
  };

  export default function withPWA(options: PWAOptions): (config: NextConfig) => NextConfig;
}
