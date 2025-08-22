import { Mastra } from "@mastra/core";
import { CloudflareDeployer } from "@mastra/deployer-cloudflare";
import { codeReviewAgent } from "./agents/code-review-agent";

export const mastra = new Mastra({
  agents: {
    codeReviewAgent,
  },
  deployer: new CloudflareDeployer({
    projectName: "cr-agent",
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    }
  }),
  server: {
    build: {
      swaggerUI: true,
    },
  },
});