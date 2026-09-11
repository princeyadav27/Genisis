import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev app is viewed through the live-preview proxy (https://{port}-{sandboxId}.e2b.app).
  // Next.js dev blocks cross-origin dev resources (/_next/*) from unknown origins,
  // which leaves the page SSR-rendered but non-interactive. Allow the preview host.
  allowedDevOrigins: ["**.e2b.app"],
};

export default nextConfig;
