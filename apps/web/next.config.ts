import "@igg/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		viewTransition: true,
	},
};

export default nextConfig;
