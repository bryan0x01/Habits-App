import { expect, test } from "@playwright/test";

test("first setup chooses support and a real-week starting point", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Make it fit my life" }).click();
  await page.getByRole("button", { name: /Focus/ }).click();
  await page.getByRole("button", { name: "Choose my week" }).click();
  await page.getByRole("radio", { name: /Mostly school/ }).click();
  await page.getByRole("button", { name: "Review my setup" }).click();
  await expect(page.getByRole("heading", { name: "Here is your calmer starting point." })).toBeVisible();
  await page.getByRole("button", { name: "Start my DayFlow" }).click();

  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByText("Tune today")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The day from here · Student week" })).toBeVisible();

  const dayflowLocalKeys = await page.evaluate(() =>
    Object.keys(window.localStorage).filter((key) => key.startsWith("dayflow:")),
  );
  expect(dayflowLocalKeys).toEqual([]);

  // A signed-out preview is intentionally temporary; Supabase is the only
  // persistent source of truth.
  await page.reload();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("Rescue mode shows exactly three moves and has a calm exit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Use the default setup" }).click();

  await page.getByRole("button", { name: /Tune today/ }).click();
  await page.getByRole("button", { name: "Rescue" }).click();

  await expect(page.getByText("1 · Tiny start")).toBeVisible();
  await expect(page.getByText("2 · One minimum")).toBeVisible();
  await expect(page.getByText("3 · Recovery")).toBeVisible();
  await expect(page.locator("main [data-rescue-card]")).toHaveCount(3);

  await page.getByRole("button", { name: "I'm steadier" }).click();
  await expect(page.getByText("Tune today")).toBeVisible();
});
