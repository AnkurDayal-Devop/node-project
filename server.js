const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const host = "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "5000", 10);
const indexPath = path.join(__dirname, "index.html");
const errorPagePath = path.join(__dirname, "error.html");

const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

function log(message) {
    const time = new Date().toISOString();
    const line = `${time} ${message}\n`;

 console.log(line);                  // Print to terminal
    fs.appendFile("app.log", line, (err) => {
        if (err) {
            console.error("Unable to write log:", err);
        }
    });
}

    if (request.method === "GET" && url.pathname === "/ping") {

       log("/ping endpoint has been called");

       response.writeHead(200, {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store"
        });
        response.end("pong");
        return;
    }

    if (request.method === "GET" && url.pathname === "/auth") {

       log("/Auth endpoint has been called");

       response.writeHead(200, {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store"
        });
        response.end("Auth endpoint has been called");
        return;
    }

    if (request.method === "GET" && url.pathname === "/health") {
        log("/health proxy endpoint has been called");

        fetch("http://127.0.0.1:8000/health", {
            signal: AbortSignal.timeout(3000)
        })
            .then(async (pythonResponse) => {
                const body = await pythonResponse.text();
                response.writeHead(pythonResponse.status, {
                    "Content-Type": pythonResponse.headers.get("content-type") || "application/json; charset=utf-8",
                    "Cache-Control": "no-store"
                });
                response.end(body);
            })
            .catch((error) => {
                log(`Python health service unavailable: ${error.message}`);
                response.writeHead(503, {
                    "Content-Type": "application/json; charset=utf-8",
                    "Cache-Control": "no-store"
                });
                response.end(JSON.stringify({
                    status: "unavailable",
                    service: "python-health",
                    message: "Python health service could not be reached on port 8000."
                }));
            });
        return;
    }

    if (request.method === "GET" && url.pathname === "/") {
        fs.readFile(indexPath, (error, content) => {
            if (error) {

                response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
                response.end("Unable to load the application");
                return;
            }

            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            response.end(content);
        });
        return;
    }

    log(`${request.method} ${url.pathname} - 404 Not Found`);

    if (request.method === "GET") {
        fs.readFile(errorPagePath, (error, content) => {
            if (error) {
                response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
                response.end("Unable to load the error page");
                return;
            }

            response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
            response.end(content);
        });
        return;
    }

    response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: "Not found" }));
});

server.listen(port, host, () => {
    console.log(`Application running at http://${host}:${port}`);
});

function shutdown() {
    server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
