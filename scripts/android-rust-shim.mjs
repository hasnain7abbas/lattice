#!/usr/bin/env node
// Drop-in replacement for `npm run tauri android android-studio-script`
// that compiles the Rust library with cargo and copies the .so into the
// gradle jniLibs folder using a plain file copy instead of a symbolic link.
// This is necessary on Windows when Developer Mode is disabled — Tauri's
// own android-studio-script tries to mklink and aborts the whole APK build.
//
// All other tauri-cli invocations are forwarded to the real binary unchanged.

import { execSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const srcTauri = join(repoRoot, "src-tauri");

const argv = process.argv.slice(2);

function findOpt(name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : null;
}

function hasFlag(name) {
  return argv.includes(name);
}

const TRIPLE_FOR_TARGET = {
  aarch64: "aarch64-linux-android",
  armv7: "armv7-linux-androideabi",
  i686: "i686-linux-android",
  x86_64: "x86_64-linux-android",
};
const ABI_FOR_TARGET = {
  aarch64: "arm64-v8a",
  armv7: "armeabi-v7a",
  i686: "x86",
  x86_64: "x86_64",
};

const looksLikeStudioScript = argv.includes("android-studio-script");

if (!looksLikeStudioScript) {
  // Forward to real tauri-cli untouched. Strip a leading "tauri" if present
  // since npx tauri adds it back on its own.
  const forward = argv[0] === "tauri" ? argv.slice(1) : argv;
  const r = spawnSync("npx", ["tauri", ...forward], {
    stdio: "inherit",
    shell: true,
  });
  process.exit(r.status ?? 1);
}

const target = findOpt("--target") || findOpt("-t") || "aarch64";
const release = hasFlag("--release") || hasFlag("-r");
const triple = TRIPLE_FOR_TARGET[target];
const abi = ABI_FOR_TARGET[target];
if (!triple || !abi) {
  console.error(`android-rust-shim: unknown target ${target}`);
  process.exit(1);
}

const profile = release ? "release" : "debug";
const so = join(srcTauri, "target", triple, profile, "liblattice_lib.so");
const dstDir = join(
  srcTauri,
  "gen",
  "android",
  "app",
  "src",
  "main",
  "jniLibs",
  abi,
);
const dst = join(dstDir, "liblattice_lib.so");

// Defer the actual cross-compile to the real tauri-cli (it knows how to set
// up the NDK toolchain). We only intervene when its symlink step trips over
// Windows non-developer-mode privileges — at that point the .so is already
// built in target/, and we just need to copy it into jniLibs ourselves.
console.log(
  `android-rust-shim: running tauri android-studio-script for ${triple} (${profile})`,
);
const tauriArgs = [
  "tauri",
  "android",
  "android-studio-script",
  "--target",
  target,
];
if (release) tauriArgs.push("--release");
const tauriResult = spawnSync("npx", tauriArgs, {
  stdio: "inherit",
  cwd: repoRoot,
  shell: true,
});

if (existsSync(so)) {
  mkdirSync(dstDir, { recursive: true });
  copyFileSync(so, dst);
  console.log(`android-rust-shim: ensured ${dst} (copied from ${so})`);
  process.exit(0);
}

// Cargo never produced the lib — propagate the failure.
console.error(
  `android-rust-shim: expected lib not found at ${so}; cargo step likely failed.`,
);
process.exit(tauriResult.status ?? 1);
