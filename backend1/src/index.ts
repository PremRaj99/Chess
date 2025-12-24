import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import "dotenv/config";

const wss = new WebSocketServer({ port: Number(process.env.PORT) || 8080 });

const gameManager = new GameManager();

wss.on("connection", function connection(ws) {
  gameManager.addUser(ws);
  ws.on("error", console.error);

  ws.on("message", function message(data) {});

  ws.on("close", () => gameManager.removeUser(ws));
});

console.log("web socket server is started on port:", Number(process.env.PORT) || 8080)