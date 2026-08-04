import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3187",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "mobile-390", use: { viewport: { width: 390, height: 844 }, channel: "chrome" } },
  ],
  webServer: {
    command: "npm.cmd run dev -- --hostname 127.0.0.1 --port 3187",
    url: "http://127.0.0.1:3187",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
