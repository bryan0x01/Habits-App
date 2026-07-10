/**
 * Generates DayFlow's PWA icons as real PNG files — no external image libs.
 *
 * Draws a rounded (or full-bleed "maskable") violet→fuchsia gradient tile with
 * a white checkmark, then hand-encodes a PNG (IHDR/IDAT/IEND) using zlib for
 * the deflate step. Run with: `npm run icons`.
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// --- CRC32 (table-based) -------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(size, pixel) {
  const raw = Buffer.alloc(size * (1 + size * 4));
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y);
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
      raw[o++] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- geometry helpers ----------------------------------------------------
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;

function sdRoundRect(px, py, half, radius) {
  const qx = Math.abs(px) - (half - radius);
  const qy = Math.abs(py) - (half - radius);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - radius;
}

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = clamp01(t);
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

// Brand gradient endpoints (violet -> fuchsia).
const TOP = [139, 92, 246];
const BOTTOM = [192, 38, 211];

function makePixel(size, { maskable }) {
  const center = size / 2;
  const half = size / 2;
  const cornerR = maskable ? 0 : size * 0.22;

  // Checkmark control points (fractions of size).
  const A = [0.3 * size, 0.53 * size];
  const B = [0.44 * size, 0.67 * size];
  const C = [0.72 * size, 0.35 * size];
  const strokeR = size * 0.045;

  return (x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;

    // Background alpha (rounded rect, anti-aliased).
    let bgA = 1;
    if (!maskable) {
      const sd = sdRoundRect(px - center, py - center, half, cornerR);
      bgA = clamp01(0.5 - sd);
    }

    const t = clamp01((px / size + py / size) / 2);
    let r = lerp(TOP[0], BOTTOM[0], t);
    let g = lerp(TOP[1], BOTTOM[1], t);
    let b = lerp(TOP[2], BOTTOM[2], t);

    // White checkmark on top.
    const d = Math.min(
      distToSegment(px, py, A[0], A[1], B[0], B[1]),
      distToSegment(px, py, B[0], B[1], C[0], C[1]),
    );
    const cov = clamp01(strokeR - d + 0.75);
    if (cov > 0) {
      r = lerp(r, 255, cov);
      g = lerp(g, 255, cov);
      b = lerp(b, 255, cov);
    }

    return [Math.round(r), Math.round(g), Math.round(b), Math.round(bgA * 255)];
  };
}

function write(path, buf) {
  const full = resolve(ROOT, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, buf);
  console.log(`  ✓ ${path} (${buf.length} bytes)`);
}

const targets = [
  { path: "public/icons/icon-192.png", size: 192, maskable: false },
  { path: "public/icons/icon-512.png", size: 512, maskable: false },
  { path: "public/icons/icon-maskable-512.png", size: 512, maskable: true },
  { path: "src/app/icon.png", size: 256, maskable: false },
  { path: "src/app/apple-icon.png", size: 180, maskable: true },
];

console.log("Generating DayFlow icons…");
for (const t of targets) {
  write(t.path, encodePng(t.size, makePixel(t.size, { maskable: t.maskable })));
}
console.log("Done.");
