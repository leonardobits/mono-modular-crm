import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
