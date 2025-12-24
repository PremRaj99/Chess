import { WebSocket } from "ws";
import { ERROR, GAME_OVER, INIT_GAME, MOVE, RESIGN } from "./messages";
import { Game } from "./Game";

export class GameManager {
  private games: Game[];
  private pendingUser: WebSocket | null;
  private users: WebSocket[];

  constructor() {
    this.games = [];
    this.users = [];
    this.pendingUser = null;
  }

  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    this.users.filter((user) => user !== socket);
    // stop the game here because the user left
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      const dataStr = data.toString() || "";
      console.log(dataStr)
      let message;
      try {
        message = JSON.parse(dataStr);
      } catch (error: any) {
        console.error("Failed to parse message:", error.message);
        return;
      }
      switch (message.type) {
        case INIT_GAME: {
          this.initializeGame(socket);
          break;
        }
        case MOVE: {
          const game = this.games.find(
            (game) => game.player1 === socket || game.player2 === socket
          );
          if (game) {
            game.makeMove(socket, message.move);
          } else {
            socket.send(
              JSON.stringify({ type: ERROR, message: "You are not in a game" })
            );
          }
          break;
        }
        case RESIGN: {
          const game = this.games.find(
            (game) => game.player1 === socket || game.player2 === socket
          );
          if (!game) {
            socket.send(
              JSON.stringify({ type: ERROR, message: "You are not in a game" })
            );
            return;
          }
          game.resign(socket);
          this.games = this.games.filter((g) => g !== game);
          break;
        }
        default:
          socket.send(
            JSON.stringify({ type: ERROR, message: "Unknown message type" })
          );
      }
    });
  }

  private initializeGame(socket: WebSocket) {
    if (this.pendingUser) {
      // start a game
      const game = new Game(socket, this.pendingUser);
      this.games.push(game);
      this.pendingUser = null;
    } else {
      this.pendingUser = socket;
      socket.send(JSON.stringify({ type: INIT_GAME, message: "wait for starting a game" }));
    }
  }
}
