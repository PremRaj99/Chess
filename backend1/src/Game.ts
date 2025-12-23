import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_CHECK, GAME_DRAW, GAME_OVER, INIT_GAME, MOVE } from "./messages";

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
        JSON.stringify({ type: "error", message: "Not your turn" })
      );
    }

    if (!isWhiteTurn && socket !== this.player2) {
      return socket.send(
        JSON.stringify({ type: "error", message: "Not your turn" })
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
        JSON.stringify({ type: "error", message: "Invalid move" })
      );
    }

    if (!result) {
      return socket.send(
        JSON.stringify({ type: "error", message: "Illegal move" })
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
    this.broadcast({
      type: "move",
      move: {
        from: result.from,
        to: result.to,
        promotion: result.promotion,
        flags: result.flags,   // IMPORTANT
        san: result.san,       // IMPORTANT
        piece: result.piece,
        color: result.color,
        captured: result.captured,
      },
    });
  }


  private checkIncomming(socket: WebSocket) {
    console.log("Check")
    socket.send(JSON.stringify({ type: GAME_CHECK, message: "Check" }));
  }

  private draw() {
    console.log("Draw")
    this.player1.send(JSON.stringify({ type: GAME_DRAW, message: "Draw" }));
    this.player2.send(JSON.stringify({ type: GAME_DRAW, message: "Draw" }));
  }

  private winner(socket: WebSocket) {
    if (socket === this.player1) {
      console.log("White is the Winner")
      socket.send(
        JSON.stringify({ type: GAME_OVER, message: "White is the Winner" })
      );
      this.player2.send(
        JSON.stringify({ type: GAME_OVER, message: "White is the Winner" })
      );
    } else {
      console.log("Black is the Winner")
      socket.send(
        JSON.stringify({ type: GAME_OVER, message: "Black is the Winner" })
      );
      this.player1.send(
        JSON.stringify({ type: GAME_OVER, message: "Black is the Winner" })
      );
    }
  }

  private broadcast(message: any) {
    const msgStr = JSON.stringify(message);
    this.player1.send(msgStr);
    this.player2.send(msgStr);
  }
}
