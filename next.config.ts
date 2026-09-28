import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Bucket name must match infra/setup.sh's default, README.md's instructions, and
  // .github/workflows/deploy.yml's GCP_BUCKET variable. The site is served via plain
  // path-style GCS URLs (no custom domain/load balancer), so it must live under this
  // sub-path or root-relative asset/link URLs would 404 against the domain root
  // instead of the bucket path.
  basePath: '/valheim-tool',
  trailingSlash: false,
  images: { unoptimized: true },
};

export default nextConfig;
