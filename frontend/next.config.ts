import type { NextConfig } from 'next';
import type { WebpackConfigContext } from 'next/dist/server/config-shared';

const nextConfig: NextConfig = {
  webpack(config: WebpackConfigContext['webpack'], options: WebpackConfigContext) {
    config.module = config.module || { rules: [] };
    config.module.rules.push({
      test: /\.node$/,
      use: 'null-loader',
    });
    return config;
  },
};

export default nextConfig;
