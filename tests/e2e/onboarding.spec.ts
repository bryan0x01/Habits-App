import { expect, test } from "@playwright/test";

test("first setup chooses support, a routine, and offers an account", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Set up DayFlow" }).click();
  await page.getByRole("button", { name: /Focus/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: /Mostly school/ }).click();
  await page.getByRole("button", { name: "Next" }).click();

  await expect(page.getByRole("heading", { name: "Save your plan" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  await page.getByRole("button", { name: "Not now" }).click();
  await expect(page.getByRole("heading", { name: "Your setup is ready." })).toBeVisible();
  await page.getByRole("button", { name: "Go to Today" }).click();

  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByText("Adjust today")).toBeVisible();
  await expect(page.locator("header").getByText(/Student week/)).toBeVisible();

  const dayflowLocalKeys = await page.evaluate(() =>
    Object.keys(window.localStorage).filter((key) => key.startsWith("dayflow:")),
  );
  expect(dayflowLocalKeys).toEqual([]);

  // A signed-out preview is intentionally temporary; Supabase is the only
  // durable data store.
  await page.reload();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("very-low mode shows exactly three choices and a clear exit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Use the starter setup" }).click();
  await page.getByRole("button", { name: "Not now" }).click();
  await page.getByRole("button", { name: "Go to Today" }).click();

  await page.getByRole("button", { name: /Adjust today/ }).click();
  await page.getByRole("button", { name: "Very low" }).click();

  await expect(page.getByText("1 · Start here")).toBeVisible();
  await expect(page.getByText("2 · One basic")).toBeVisible();
  await expect(page.getByText("3 · One missed task")).toBeVisible();
  await expect(page.locator("main [data-rescue-card]")).toHaveCount(3);

  await page.getByRole("button", { name: "Show more" }).click();
  await expect(page.getByText("Adjust today")).toBeVisible();
});
