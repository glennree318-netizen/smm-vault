/* Minimal PNG encoder + procedural icon rasterizer.
   No image libraries: raw RGBA -> zlib -> PNG chunks. Node's zlib is built in. */
const zlib = require("zlib");
const fs = require("fs");

function crc32(buf) {
  let c, table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function encodePNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // colour type RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---- draw the icon: dark rounded square, pink bolt, green dot ---- */
const BG = [15, 15, 15];
const CARD = [28, 28, 30];
const PINK = [255, 105, 180];
const GREEN = [76, 175, 80];
const STROKE = [255, 105, 180];

function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }

// bolt polygon, scaled to size
const BOLT = [[0.60,0.30],[0.38,0.55],[0.49,0.55],[0.44,0.72],[0.64,0.46],[0.53,0.46]];

function render(size) {
  const buf = Buffer.alloc(size * size * 4);
  const s = size / 512;
  const radius = 112 * s;
  const put = (x, y, c, a) => {
    const i = (y * size + x) * 4;
    if (a >= 255) { buf[i] = c[0]; buf[i+1] = c[1]; buf[i+2] = c[2]; buf[i+3] = 255; return; }
    const ia = a / 255;
    buf[i] = Math.round(buf[i] * (1 - ia) + c[0] * ia);
    buf[i+1] = Math.round(buf[i+1] * (1 - ia) + c[1] * ia);
    buf[i+2] = Math.round(buf[i+2] * (1 - ia) + c[2] * ia);
    buf[i+3] = Math.max(buf[i+3], a);
  };

  // rounded rect coverage (4x supersample for smooth edges)
  const SS = 4;
  const inRound = (x, y, x0, y0, x1, y1, r) => {
    const cx = Math.min(Math.max(x, x0 + r), x1 - r);
    const cy = Math.min(Math.max(y, y0 + r), y1 - r);
    const dx = x - cx, dy = y - cy;
    return dx * dx + dy * dy <= r * r;
  };
  const inPoly = (px, py, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };

  const inner = [112 * s, 112 * s, size - 112 * s, size - 112 * s];
  const innerR = 40 * s;
  const dotC = [164 * s, 164 * s];
  const dotR = 13 * s;
  const boltPts = BOLT.map(([x, y]) => [x * size, y * size]);
  const strokeW = 16 * s;
  const strokeHalf = strokeW / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let aOut = 0, aCard = 0, aBolt = 0, aDot = 0, aStroke = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          if (inRound(px, py, 0, 0, size, size, radius)) aOut += 255 / (SS * SS);
          if (inRound(px, py, inner[0], inner[1], inner[2], inner[3], innerR)) aCard += 255 / (SS * SS);
          if (inPoly(px, py, boltPts)) aBolt += 255 / (SS * SS);
          if ((px - dotC[0]) ** 2 + (py - dotC[1]) ** 2 <= dotR * dotR) aDot += 255 / (SS * SS);
          // stroke = inside card, near the edge
          if (inRound(px, py, inner[0], inner[1], inner[2], inner[3], innerR)) {
            const nearEdge =
              Math.abs(px - inner[0]) <= strokeHalf || Math.abs(py - inner[1]) <= strokeHalf ||
              Math.abs(px - inner[2]) <= strokeHalf || Math.abs(py - inner[3]) <= strokeHalf;
            if (nearEdge) aStroke += 255 / (SS * SS);
          }
        }
      }
      if (aOut > 0) put(x, y, BG, Math.round(aOut));
      if (aCard > 0) put(x, y, CARD, Math.round(aCard));
      if (aStroke > 0) put(x, y, STROKE, Math.round(aStroke));
      if (aBolt > 0) put(x, y, PINK, Math.round(aBolt));
      if (aDot > 0) put(x, y, GREEN, Math.round(aDot));
    }
  }
  return buf;
}

[192, 512].forEach((size) => {
  const png = encodePNG(size, size, render(size));
  const out = "public/icons/icon-" + size + ".png";
  fs.writeFileSync(out, png);
  console.log("wrote " + out + " (" + png.length + " bytes)");
});