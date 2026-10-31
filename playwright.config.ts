import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e", timeout: 60_000, workers: 2, retries: 0,
  reporter: [["list"], ["json", { outputFile: "/workspace/cargo/qa/results.json" }]],
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3100", viewport: { width: 1440, height: 900 },
    launchOptions: { args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] } },
  webServer: { command: "npm run dev -- -p 3100", url: "http://localhost:3100/login", reuseExistingServer: true, timeout: 120_000 },
});
