import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
if (!existsSync(".env"))
  writeFileSync(
    ".env",
    readFileSync(".env.example", "utf8").replace(
      "replace-with-a-random-secret-at-least-32-characters",
      randomBytes(48).toString("base64url"),
    ),
  );
const config = readFileSync(".env", "utf8");
if (config.includes("replace-with-a-random-secret-at-least-32-characters"))
  writeFileSync(
    ".env",
    config.replace(
      "replace-with-a-random-secret-at-least-32-characters",
      randomBytes(48).toString("base64url"),
    ),
  );
const url =
  process.env.DATABASE_URL ||
  config.match(/^DATABASE_URL="?([^"\r\n]+)"?/m)?.[1];
if (url?.startsWith("file:")) {
  mkdirSync("prisma", { recursive: true });
  const path = url.slice(5);
  const target = path.startsWith("./") ? `prisma/${path.slice(2)}` : path;
  const db = new DatabaseSync(target);
  db.exec("PRAGMA user_version=0");
  db.close();
}
console.log("Local environment and SQLite file are ready.");
