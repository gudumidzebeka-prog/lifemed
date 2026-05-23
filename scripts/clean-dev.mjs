import { rmSync } from "node:fs";
import { execSync } from "node:child_process";

try {
  if (process.platform === "win32") {
    const output = execSync('netstat -aon | findstr ":3000" | findstr "LISTENING"', {
      encoding: "utf8",
    });
    for (const line of output.split(/\r?\n/)) {
      const pid = line.trim().split(/\s+/).pop();
      if (pid && /^\d+$/.test(pid)) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        } catch {
          /* ignore */
        }
      }
    }
  }
} catch {
  /* port may already be free */
}

try {
  rmSync(".next", { recursive: true, force: true });
  console.log("Removed .next cache");
} catch {
  /* ignore */
}
