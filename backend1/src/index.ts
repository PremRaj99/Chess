import http from "http";
import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import "dotenv/config";

const PORT = Number(process.env.PORT);

if (!PORT) {
  throw new Error("PORT is not defined");
}

// Create HTTP server (required for Render)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebSocket server running");
});

// Attach WebSocket to HTTP server
const wss = new WebSocketServer({ server });

const gameManager = new GameManager();

wss.on("connection", (ws) => {
  gameManager.addUser(ws);

  ws.on("error", console.error);

  ws.on("message", (data) => {
    // handle message
  });

  ws.on("close", () => {
    gameManager.removeUser(ws);
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
