import { createServer } from "node:http";
import { readFile, mkdir, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const publicRoot = path.join(root, "dist");
const reportRoot = path.join(root, ".lighthouse");
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};
await stat(path.join(publicRoot, "index.html"));
await mkdir(reportRoot, { recursive: true });

const server = createServer(async (request, response) => {
  try {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405).end();
      return;
    }
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    const file = path.resolve(
      publicRoot,
      `.${pathname.endsWith("/") ? `${pathname}index.html` : pathname}`,
    );
    if (!file.startsWith(`${publicRoot}${path.sep}`)) {
      response.writeHead(403).end();
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, {
      "Content-Type":
        mimeTypes[path.extname(file)] || "application/octet-stream",
      "Content-Length": body.length,
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}/`;
const failures = [];
try {
  for (const page of [
    { name: "service", path: "" },
    { name: "md", path: "md/" },
  ]) {
    for (const device of ["mobile", "desktop"]) {
      const output = path.join(reportRoot, `${page.name}-${device}`);
      const args = [
        path.join(root, "node_modules/lighthouse/cli/index.js"),
        `${url}${page.path}`,
        "--chrome-flags=--headless",
        "--quiet",
        "--only-categories=performance,accessibility,best-practices,seo",
        "--output=json",
        "--output=html",
        `--output-path=${output}`,
      ];
      if (device === "desktop") args.push("--preset=desktop");
      await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, args, { stdio: "inherit" });
        child.on("error", reject);
        child.on("exit", (code) =>
          code === 0
            ? resolve()
            : reject(new Error(`Lighthouse exited with ${code}`)),
        );
      });
      const report = JSON.parse(
        await readFile(`${output}.report.json`, "utf8"),
      );
      if (report.runtimeError) throw new Error(report.runtimeError.message);
      for (const [name, category] of Object.entries(report.categories)) {
        console.log(
          `${page.name} ${device} ${name}: ${Math.round(category.score * 100)}/100`,
        );
        if (category.score === null || category.score < 0.95)
          failures.push(`${page.name} ${device} ${name} below 95`);
      }
      const budgets = {
        "largest-contentful-paint": 2500,
        "total-blocking-time": 200,
        "cumulative-layout-shift": 0.1,
        "total-byte-weight": 250 * 1024,
      };
      for (const [metric, budget] of Object.entries(budgets)) {
        const actual = report.audits[metric].numericValue;
        console.log(
          `${page.name} ${device} ${metric}: ${actual.toFixed(2)} (budget ${budget})`,
        );
        if (!Number.isFinite(actual) || actual > budget)
          failures.push(`${page.name} ${device} ${metric} exceeds ${budget}`);
      }
    }
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    "All performance, accessibility, best-practice, and SEO budgets passed. Reports: .lighthouse/",
  );
}
