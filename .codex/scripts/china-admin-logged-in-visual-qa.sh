#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
timestamp="$(date +%Y%m%d%H%M%S)"

base_url="${CODEX_ADMIN_VISUAL_QA_BASE_URL:-http://localhost:7000}"
admin_email="${CODEX_ADMIN_VISUAL_QA_EMAIL:-codex-refund-review-admin@example.com}"
admin_password="${CODEX_ADMIN_VISUAL_QA_PASSWORD:-Codex123456!}"
output_dir="${CODEX_ADMIN_VISUAL_QA_OUTPUT_DIR:-${root}/.codex/artifacts/admin-visual-qa-${timestamp}}"
work_dir="${CODEX_ADMIN_VISUAL_QA_WORK_DIR:-${TMPDIR:-/tmp}/fuyi-playwright-admin-qa}"
require_pg_source="${CODEX_ADMIN_VISUAL_QA_REQUIRE_PG_SOURCE:-false}"
install_browsers="${CODEX_ADMIN_VISUAL_QA_INSTALL_BROWSERS:-auto}"

load_runtime() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
    nvm use >/tmp/fuyi-nvm-use-admin-visual-qa.log
  fi

  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"

  command -v node >/dev/null || {
    echo "node not found after loading runtime." >&2
    exit 1
  }

  command -v bun >/dev/null || {
    echo "bun not found after loading runtime." >&2
    exit 1
  }
}

usage() {
  cat <<USAGE
Usage:
  ./.codex/scripts/china-admin-logged-in-visual-qa.sh [plan]

Runs logged-in Admin visual QA against the local Admin panel.

Environment:
  CODEX_ADMIN_VISUAL_QA_BASE_URL        default: http://localhost:7000
  CODEX_ADMIN_VISUAL_QA_EMAIL           default: codex-refund-review-admin@example.com
  CODEX_ADMIN_VISUAL_QA_PASSWORD        default: Codex123456!
  CODEX_ADMIN_VISUAL_QA_OUTPUT_DIR      default: .codex/artifacts/admin-visual-qa-YYYYMMDDHHMMSS
  CODEX_ADMIN_VISUAL_QA_WORK_DIR        default: /tmp/fuyi-playwright-admin-qa
  CODEX_ADMIN_VISUAL_QA_REQUIRE_PG_SOURCE default: false
  CODEX_ADMIN_VISUAL_QA_INSTALL_BROWSERS  default: auto

The script captures:
- /cn/operations/unit-permissions desktop
- /cn/operations/unit-permissions desktop with seller selector open
- /cn/operations/unit-permissions mobile
- /cn/operations/module-switches desktop
- /cn/operations/module-switches mobile

It asserts:
- Admin login is usable.
- Unit permissions page renders Vendor visible/hidden effective preview.
- Unit permissions page includes financeReadOnly copy.
- Module switches page renders platform module switch copy.
- No page shows Failed to fetch / effective preview failure.
- Desktop and mobile pages have no page-level horizontal overflow.

Side effects:
- Browser login/session only.
- Writes screenshots and summary.json to CODEX_ADMIN_VISUAL_QA_OUTPUT_DIR.
- Writes temporary Playwright files only to CODEX_ADMIN_VISUAL_QA_WORK_DIR.
- Does not call Admin/Vendor write APIs, create orders, publish products,
  print waybills, start livestreams, mutate payment/refund/settlement/
  commission/payout/permission/fulfillment/logistics, or grant RBAC.
USAGE
}

case "${1:-}" in
  -h|--help|help)
    usage
    exit 0
    ;;
  plan|--plan)
    cat <<PLAN
PLAN China Admin logged-in visual QA
Admin URL: ${base_url}
Output directory: ${output_dir}
Temporary Playwright work dir: ${work_dir}
Flow:
- Open ${base_url}/login and authenticate with CODEX_ADMIN_VISUAL_QA_EMAIL.
- Capture unit permission page in desktop viewport.
- Open the seller selector and capture the dropdown state.
- Capture unit permission page in mobile viewport.
- Capture module switches page in desktop and mobile viewports.
- Write summary.json with screenshot paths and assertion results.
Authentication boundary:
- Uses only the local Admin login form.
- Does not print the password.
Side effects:
- Browser login/session and screenshot files only.
- No Admin/Vendor write route is called by this script.
- No payment/refund/settlement/commission/payout/permission/fulfillment/logistics runtime is touched.
PLAN
    exit 0
    ;;
  "")
    ;;
  *)
    echo "Unknown argument: $1" >&2
    usage >&2
    exit 2
    ;;
esac

ensure_playwright() {
  mkdir -p "$work_dir"

  if [ ! -f "$work_dir/package.json" ]; then
    cat >"$work_dir/package.json" <<'JSON'
{"private":true,"type":"module","dependencies":{"playwright":"^1.57.0"}}
JSON
  fi

  if ! (cd "$work_dir" && node -e "import('playwright')" >/dev/null 2>&1); then
    (cd "$work_dir" && bun install --silent)
  fi

  if ! (cd "$work_dir" && node -e "import('playwright')" >/dev/null 2>&1); then
    echo "Unable to load playwright from ${work_dir}." >&2
    exit 1
  fi

  local browser_missing
  if (cd "$work_dir" && node - <<'NODE' >/dev/null 2>&1
import { chromium } from "playwright";
import fs from "node:fs";
if (!fs.existsSync(chromium.executablePath())) {
  process.exit(1);
}
NODE
  ); then
    browser_missing="false"
  else
    browser_missing="true"
  fi

  if [ "$browser_missing" = "true" ]; then
    case "$install_browsers" in
      auto|true|1|yes)
        (cd "$work_dir" && bunx playwright install chromium)
        ;;
      false|0|no|never)
        echo "Playwright chromium is missing and CODEX_ADMIN_VISUAL_QA_INSTALL_BROWSERS=${install_browsers}." >&2
        exit 1
        ;;
      *)
        echo "Unknown CODEX_ADMIN_VISUAL_QA_INSTALL_BROWSERS=${install_browsers}" >&2
        exit 1
        ;;
    esac
  fi
}

write_runner() {
  cat >"$work_dir/admin-logged-in-visual-qa.mjs" <<'NODE'
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.CODEX_ADMIN_VISUAL_QA_BASE_URL ?? "http://localhost:7000";
const email = process.env.CODEX_ADMIN_VISUAL_QA_EMAIL ?? "codex-refund-review-admin@example.com";
const password = process.env.CODEX_ADMIN_VISUAL_QA_PASSWORD ?? "Codex123456!";
const outDir = process.env.CODEX_ADMIN_VISUAL_QA_OUTPUT_DIR;
const requirePgSource = (process.env.CODEX_ADMIN_VISUAL_QA_REQUIRE_PG_SOURCE ?? "false") === "true";

if (!outDir) {
  throw new Error("CODEX_ADMIN_VISUAL_QA_OUTPUT_DIR is required");
}

await fs.mkdir(outDir, { recursive: true });

const screenshots = [];
const pages = [];

function fail(message, details = {}) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

async function login(page) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle", timeout: 45_000 });

  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  if ((await emailInput.count()) === 0) {
    return {
      skipped: true,
      url: page.url(),
      reason: "login form not visible; assuming existing session",
    };
  }

  await emailInput.fill(email);
  await page.locator('input[name="password"], input[type="password"]').first().fill(password);

  const submit = page.locator('button[type="submit"]').first();
  if ((await submit.count()) > 0) {
    await submit.click();
  } else {
    await page.keyboard.press("Enter");
  }

  await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => {});
  await page.waitForTimeout(1500);

  return {
    skipped: false,
    url: page.url(),
  };
}

async function inspectPage(page, routeName) {
  return await page.evaluate((name) => {
    const root = document.documentElement;
    const text = document.body?.innerText ?? "";
    const visibleRects = [...document.querySelectorAll("body *")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          element,
          rect,
        };
      })
      .filter(({ rect }) => rect.width > 0 && rect.height > 0);

    const rightOverflow = visibleRects
      .filter(({ rect }) => rect.right > root.clientWidth + 2)
      .slice(0, 10)
      .map(({ element, rect }) => ({
        tag: element.tagName,
        text: (element.innerText || element.getAttribute("aria-label") || "").trim().slice(0, 100),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      }));

    return {
      routeName: name,
      url: location.href,
      title: document.title,
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      hasHorizontalOverflow: root.scrollWidth > root.clientWidth + 2,
      rightOverflow,
      textSample: text.slice(0, 900),
      hasFailedFetch: text.includes("Failed to fetch") || text.includes("读取 effective view 失败"),
      hasVendorVisible: text.includes("Vendor 会显示"),
      hasVendorHidden: text.includes("Vendor 会隐藏"),
      hasFinanceReadOnly: text.includes("财务结算只读") || text.includes("financeReadOnly"),
      hasSellerSelector: Boolean(document.querySelector('[role="combobox"]')),
      hasAdminSource: text.includes("pg_admin_draft") || text.includes("server_memory_draft"),
      hasPgAdminSource: text.includes("pg_admin_draft"),
      hasModuleSwitchTitle: text.includes("模块开关"),
      hasPlatformDraftCopy: text.includes("平台默认草稿"),
    };
  }, routeName);
}

function assertUnitPage(check) {
  if (check.hasFailedFetch) {
    fail(`${check.routeName} still has an effective preview fetch failure`, check);
  }
  if (check.hasHorizontalOverflow) {
    fail(`${check.routeName} has page-level horizontal overflow`, check);
  }
  for (const [key, label] of [
    ["hasVendorVisible", "Vendor 会显示"],
    ["hasVendorHidden", "Vendor 会隐藏"],
    ["hasFinanceReadOnly", "财务结算只读"],
    ["hasSellerSelector", "seller selector"],
    ["hasAdminSource", "effective source label"],
  ]) {
    if (!check[key]) {
      fail(`${check.routeName} missing ${label}`, check);
    }
  }
  if (requirePgSource && !check.hasPgAdminSource) {
    fail(`${check.routeName} expected pg_admin_draft source`, check);
  }
}

function assertModuleSwitchPage(check) {
  if (check.hasFailedFetch) {
    fail(`${check.routeName} has fetch failure text`, check);
  }
  if (check.hasHorizontalOverflow) {
    fail(`${check.routeName} has page-level horizontal overflow`, check);
  }
  if (!check.hasModuleSwitchTitle) {
    fail(`${check.routeName} missing 模块开关`, check);
  }
  if (!check.hasPlatformDraftCopy) {
    fail(`${check.routeName} missing 平台默认草稿`, check);
  }
}

async function openCaptureAssert(page, url, fileName, routeName, assertFn) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
  await page.waitForTimeout(1500);
  const check = await inspectPage(page, routeName);
  const filePath = path.join(outDir, fileName);
  await page.screenshot({ path: filePath, fullPage: true });
  screenshots.push(filePath);
  pages.push({ screenshot: filePath, ...check });
  assertFn(check);
  return check;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1200 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const consoleErrors = [];
const requestFailures = [];

page.on("console", (message) => {
  if (message.type() === "error") {
    consoleErrors.push(message.text());
  }
});
page.on("requestfailed", (request) => {
  requestFailures.push({
    url: request.url(),
    failure: request.failure()?.errorText ?? "unknown",
  });
});

const loginResult = await login(page);

await page.setViewportSize({ width: 1440, height: 1200 });
await openCaptureAssert(
  page,
  `${baseUrl}/cn/operations/unit-permissions`,
  "unit-permissions-desktop.png",
  "unit-permissions-desktop",
  assertUnitPage,
);

const sellerSelector = page.locator('[role="combobox"]').first();
let sellerSelectorOpened = false;
if ((await sellerSelector.count()) > 0) {
  await sellerSelector.click();
  await page.waitForTimeout(600);
  const selectOpenPath = path.join(outDir, "unit-permissions-desktop-seller-select-open.png");
  await page.screenshot({ path: selectOpenPath, fullPage: true });
  screenshots.push(selectOpenPath);
  sellerSelectorOpened = true;
}

await page.setViewportSize({ width: 390, height: 1200 });
await openCaptureAssert(
  page,
  `${baseUrl}/cn/operations/unit-permissions`,
  "unit-permissions-mobile.png",
  "unit-permissions-mobile",
  assertUnitPage,
);

await page.setViewportSize({ width: 1440, height: 1200 });
await openCaptureAssert(
  page,
  `${baseUrl}/cn/operations/module-switches`,
  "module-switches-desktop.png",
  "module-switches-desktop",
  assertModuleSwitchPage,
);

await page.setViewportSize({ width: 390, height: 1200 });
await openCaptureAssert(
  page,
  `${baseUrl}/cn/operations/module-switches`,
  "module-switches-mobile.png",
  "module-switches-mobile",
  assertModuleSwitchPage,
);

await browser.close();

const summary = {
  verdict: "PASS",
  createdAt: new Date().toISOString(),
  baseUrl,
  outDir,
  loginResult,
  sellerSelectorOpened,
  screenshots,
  pages,
  consoleErrors,
  requestFailures,
  nonGoals: [
    "No Admin/Vendor write route is called.",
    "No payment/refund/settlement/commission/payout/permission/fulfillment/logistics runtime is touched.",
  ],
};

await fs.writeFile(path.join(outDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
NODE
}

load_runtime
ensure_playwright
mkdir -p "$output_dir"
write_runner

export CODEX_ADMIN_VISUAL_QA_BASE_URL="$base_url"
export CODEX_ADMIN_VISUAL_QA_EMAIL="$admin_email"
export CODEX_ADMIN_VISUAL_QA_PASSWORD="$admin_password"
export CODEX_ADMIN_VISUAL_QA_OUTPUT_DIR="$output_dir"
export CODEX_ADMIN_VISUAL_QA_REQUIRE_PG_SOURCE="$require_pg_source"

(cd "$work_dir" && node admin-logged-in-visual-qa.mjs)

printf 'ADMIN_VISUAL_QA_OUTPUT_DIR=%s\n' "$output_dir"
printf 'ADMIN_VISUAL_QA_SUMMARY=%s\n' "$output_dir/summary.json"
