import {
	defineCloudflareConfig,
	type OpenNextConfig,
} from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
	...defineCloudflareConfig(),
	buildCommand: "pnpm run build:cf",
};

export default config;
