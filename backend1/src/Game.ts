import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { ERROR, GAME_CHECK, GAME_DRAW, GAME_OVER, INIT_GAME, MOVE } from "./messages";

export class Game {
  public player1: WebSocket; // w
  public player2: WebSocket; // b
  public board: Chess;
  //   private startTime: Date;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    // this.startTime = new Date();

    const ramdomNum = Math.random();
    if (ramdomNum < 0.5) {
      this.player1 = player1;
      this.player2 = player2;
    } else {
      this.player1 = player2;
      this.player2 = player1;
    }

    this.player1.send(
      JSON.stringify({ type: INIT_GAME, message: "You are White" })
    );
    this.player2.send(
      JSON.stringify({ type: INIT_GAME, message: "You are Black" })
    );
  }

  public makeMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
      promotion?: "q" | "r" | "b" | "n";
    }
  ) {
    // ---------------- TURN CHECK ----------------
    const isWhiteTurn = this.board.turn() === "w";

    if (isWhiteTurn && socket !== this.player1) {
      return socket.send(
        JSON.stringify({ type: ERROR, message: "Not your turn" })
      );
    }

    if (!isWhiteTurn && socket !== this.player2) {
      return socket.send(
        JSON.stringify({ type: ERROR, message: "Not your turn" })
      );
    }

    // ---------------- APPLY MOVE ----------------
    let result;
    try {
      result = this.board.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion ?? "q", // default queen
      });
    } catch {
      return socket.send(
        JSON.stringify({ type: ERROR, message: "Invalid move" })
      );
    }

    if (!result) {
      return socket.send(
        JSON.stringify({ type: ERROR, message: "Illegal move" })
      );
    }

    // ---------------- GAME END ----------------
    if (this.board.isCheckmate()) {
      this.winner(result.color === "w" ? this.player1 : this.player2);
      return;
    }

    if (this.board.isDraw() || this.board.isStalemate()) {
      this.draw();
      return;
    }

    // ---------------- CHECK ----------------
    if (this.board.isCheck()) {
      const target =
        result.color === "w" ? this.player2 : this.player1;
      this.checkIncomming(target);
    }

    // ---------------- BROADCAST MOVE ----------------
    let captured;
    switch (result.captured) {
      case 'p': captured = 'pawn'; break;
      case 'r': captured = 'rook'; break;
      case 'n': captured = 'knight'; break;
      case 'b': captured = 'bishop'; break;
      case 'q': captured = 'queen'; break;
      case 'k': captured = 'king'; break;
      default: captured = null;
    }

    let promotion;
    switch (result.promotion) {
      case 'q': promotion = 'queen'; break;
      case 'r': promotion = 'rook'; break;
      case 'b': promotion = 'bishop'; break;
      case 'n': promotion = 'knight'; break;
      default: promotion = null;
    }

    let capturedOn: string | null = null;

    if (result.captured) {
      if (result.flags.includes("e")) {
        // En passant: captured pawn is behind the destination square
        const file = result.to[0];
        const rank =
          result.color === "w"
            ? parseInt(result.to[1]) - 1
            : parseInt(result.to[1]) + 1;

        capturedOn = `${file}${rank}`;
      } else {
        // Normal capture
        capturedOn = result.to;
      }
    }


    this.broadcast({
      type: MOVE,
      move: {
        from: result.from,
        to: result.to,
        promotion: promotion,
        captured: result.captured ? { type: captured, color: result.color === "w" ? "black" : "white" } : null,
        capturedOn: capturedOn,
      },
      nextTurn: this.board.turn() === "w" ? "white" : "black",
    });
  }


  private checkIncomming(socket: WebSocket) {
    console.log("Check")
    socket.send(JSON.stringify({ type: GAME_CHECK, message: "Check" }));
  }

  private draw() {
    console.log("Draw")
    this.broadcast({ type: GAME_DRAW, message: "Game is a Draw" });
  }

  private winner(socket: WebSocket) {
    if (socket === this.player1) {
      console.log("White is the Winner")
      this.broadcast({ type: GAME_OVER, message: "White is the Winner" })

    } else {
      console.log("Black is the Winner")
      this.broadcast({ type: GAME_OVER, message: "Black is the Winner" })
    }
  }

  public resign(socket: WebSocket) {
    if (socket === this.player1) {
      console.log("Black is the Winner by Resignation")
      this.broadcast({ type: GAME_OVER, message: "Black is the Winner by Resignation" })
    } else {
      console.log("White is the Winner by Resignation")
      this.broadcast({ type: GAME_OVER, message: "White is the Winner by Resignation" })
    }
  }

  public broadcast(message: any) {
    const msgStr = JSON.stringify(message);
    this.player1.send(msgStr);
    this.player2.send(msgStr);
  }

  public destroy() {

    this.player1.close();
    this.player2.close();
  }
}
