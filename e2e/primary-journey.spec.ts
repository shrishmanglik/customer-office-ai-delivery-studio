import { expect, test } from "@playwright/test";

test("primary synthetic workflow reaches a human-gated release receipt", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Turn an AI workflow/ })).toBeVisible();
  await page.getByTestId("scenario-stale-source").click();
  await expect(page.getByTestId("run-outcome")).toHaveText("BLOCKED_SOURCE");
  await page.getByTestId("scenario-denied-write").click();
  await expect(page.getByTestId("run-outcome")).toHaveText("BLOCKED_PERMISSION");
  await page.getByTestId("scenario-jira-timeout").click();
  await expect(page.getByTestId("run-outcome")).toHaveText("MANUAL_FALLBACK");
  await page.getByTestId("scenario-golden").click();
  await expect(page.getByTestId("run-outcome")).toHaveText("COMPLETED");
  await expect(page.getByTestId("issue-receipt")).toBeDisabled();
  await page.getByTestId("approval-services").check();
  await page.getByTestId("approval-security").check();
  await page.getByTestId("issue-receipt").click();
  await expect(page.getByTestId("release-receipt")).toContainText("RELEASE_CANDIDATE");
  await expect(page.getByTestId("receipt-digest")).toHaveText(/^[a-f0-9]{64}$/);
});

test("390px review surface has no page-level horizontal overflow", async ({ page }) => {
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
