import "@testing-library/jest-dom/vitest";
import { webcrypto } from "node:crypto";

// jsdom doesn't implement window.crypto.subtle, so polyfill it with Node's webcrypto
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    writable: true,
  });
}

// Also ensure window.crypto is set (crypto.ts references window.crypto.subtle)
if (typeof window !== "undefined" && !window.crypto?.subtle) {
  Object.defineProperty(window, "crypto", {
    value: webcrypto,
    writable: true,
  });
}
