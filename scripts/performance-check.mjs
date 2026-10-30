import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import fs from "node:fs";
const chrome = await launch({
  chromePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  chromeFlags: ["--headless=new", "--disable-gpu"],
});
try {
  const result = await lighthouse(
    process.env.BASE_URL || "http://127.0.0.1:3001",
    {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    },
  );
  if (!result) throw new Error("No Lighthouse report returned");
  fs.mkdirSync("test-results", { recursive: true });
  fs.writeFileSync("test-results/lighthouse.json", result.report);
  console.log(
    JSON.stringify(
      Object.fromEntries(
        Object.entries(result.lhr.categories).map(([key, value]) => [
          key,
          Math.round(value.score * 100),
        ]),
      ),
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      Object.entries(result.lhr.audits)
        .filter(([, value]) => value.score !== null && value.score < 1)
        .map(([key, value]) => ({
          id: key,
          title: value.title,
          score: value.score,
          display: value.displayValue,
        })),
      null,
      2,
    ),
  );
} finally {
  await chrome.kill();
}
