import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

function stageSavePlugin() {
  return {
    name: "stage-save-plugin",
    configureServer(server) {
      server.middlewares.use("/api/save-stage", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ ok: false, message: "Method not allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });

        req.on("end", () => {
          try {
            const payload = JSON.parse(body || "{}");
            const fileName = String(payload.fileName || "").trim();
            const content = String(payload.content || "");

            if (!/^stage-\d{3}\.xml$/u.test(fileName)) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(
                JSON.stringify({ ok: false, message: "Invalid file name" }),
              );
              return;
            }

            const outputPath = resolve(
              server.config.root,
              "data",
              "stages",
              fileName,
            );
            mkdirSync(dirname(outputPath), { recursive: true });
            writeFileSync(outputPath, content, "utf8");

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ ok: true, path: outputPath }));
          } catch (error) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(
              JSON.stringify({
                ok: false,
                message:
                  error instanceof Error ? error.message : "Unknown error",
              }),
            );
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [vue(), stageSavePlugin()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    host: "0.0.0.0",
    port: 9000,
  },
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        game: "game.html",
        designer: "designer.html",
        popup: "popup.html",
        options: "options.html",
      },
    },
  },
});
