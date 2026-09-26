import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { calculate } from "./calculator.js";

const port = Number(process.env.PORT) || 3000;
const assets = {
  "/": ["public/index.html", "text/html; charset=utf-8"],
  "/styles.css": ["public/styles.css", "text/css; charset=utf-8"],
  "/app.js": ["public/app.js", "text/javascript; charset=utf-8"],
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16_384) {
      throw new RangeError("El cuerpo de la solicitud es demasiado grande.");
    }
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;

  if (pathname === "/api/calculate") {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      sendJson(response, 405, { error: "Usa el método POST." });
      return;
    }

    if (!request.headers["content-type"]?.includes("application/json")) {
      sendJson(response, 415, { error: "El cuerpo debe ser JSON." });
      return;
    }

    try {
      const { left, right, operator } = await readJson(request);
      const result = calculate(left, right, operator);
      sendJson(response, 200, { result });
    } catch (error) {
      const status = error instanceof SyntaxError ? 400 : 400;
      sendJson(response, status, { error: error.message });
    }
    return;
  }

  if (request.method !== "GET" || !assets[pathname]) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("No encontrado");
    return;
  }

  const [file, contentType] = assets[pathname];
  try {
    const content = await readFile(new URL(`../${file}`, import.meta.url));
    response.writeHead(200, {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    });
    response.end(content);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("No se pudo cargar la aplicación.");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Calculadora Pixel lista en http://localhost:${port}`);
});