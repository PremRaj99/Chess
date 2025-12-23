"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChessBoard } from "@/components/chess-board";
import { CapturedPieces } from "@/components/captured-pieces";
import { MoveHistory } from "@/components/move-history";
import { Crown, Loader2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { PieceColor, PieceType } from "@/components/chess-pieces";

type GameState = "waiting" | "playing" | "finished";
export type PlayerColor = "white" | "black";

export type Piece = {
  type: PieceType;
  color: PieceColor;
} | null;

const initialBoard: Piece[][] = [
  [
    { type: "rook", color: "black" },
    { type: "knight", color: "black" },
    { type: "bishop", color: "black" },
    { type: "queen", color: "black" },
    { type: "king", color: "black" },
    { type: "bishop", color: "black" },
    { type: "knight", color: "black" },
    { type: "rook", color: "black" },
  ],
  Array(8).fill({ type: "pawn", color: "black" }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: "pawn", color: "white" }),
  [
    { type: "rook", color: "white" },
    { type: "knight", color: "white" },
    { type: "bishop", color: "white" },
    { type: "queen", color: "white" },
    { type: "king", color: "white" },
    { type: "bishop", color: "white" },
    { type: "knight", color: "white" },
    { type: "rook", color: "white" },
  ],
];

export default function GamePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [playerColor, setPlayerColor] = useState<PlayerColor>("white");
  const [currentTurn, setCurrentTurn] = useState<PlayerColor>("white");
  const wsRef = useRef<WebSocket | null>(null);
  const [board, setBoard] = useState<Piece[][]>(initialBoard);

  useEffect(() => {
    connectToGameServer();
  }, []);

  const connectToGameServer = () => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "init_game" }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "init_game":
          setGameState("playing");
          setPlayerColor(msg.message.includes("White") ? "white" : "black");
          break;

        case "move":
          applyRemoteMove(msg.move);
          break;

        case "game_over":
        case "game_draw":
          alert(msg.message);
          setGameState("finished");
          break;
      }
    };
  };

  function applyRemoteMove(move: { from: string; to: string }) {
    setBoard((prev) => {
      const newBoard = prev.map((r) => [...r]);

      const [fr, fc] = algebraicToIndex(move.from);
      const [tr, tc] = algebraicToIndex(move.to);

      newBoard[tr][tc] = newBoard[fr][fc];
      newBoard[fr][fc] = null;

      return newBoard;
    });
  }

  function algebraicToIndex(pos: string): [number, number] {
    const file = pos.charCodeAt(0) - 97;
    const rank = 8 - parseInt(pos[1]);
    return [rank, file];
  }

  const sendMove = (from: string, to: string) => {
    wsRef.current?.send(
      JSON.stringify({
        type: "move",
        move: { from, to },
      })
    );
  };

  if (gameState === "waiting") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 text-center bg-card border-border">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Finding Opponent...
            </h2>
            <p className="text-muted-foreground">
              Please wait while we match you with a player
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 py-4">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm text-foreground">You</span>
            </div>

            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Opponent</span>
            </div>
          </div>

          <Button variant="outline" onClick={() => router.push("/")}>
            Cancel
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              ChessMaster
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/")}>
            Leave Game
          </Button>
        </div>
      </header>

      {/* Game Content */}
      <div className="container mx-auto p-4">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 max-w-7xl mx-auto">
          {/* Main Game Area */}
          <div className="space-y-2">
            {/* Opponent Info */}
            <Card className="p-2 bg-card border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Opponent</p>
                    <CapturedPieces
                      color={playerColor === "white" ? "black" : "white"}
                    />
                  </div>
                </div>
                <Badge
                  variant={
                    currentTurn !== playerColor ? "default" : "secondary"
                  }
                >
                  {currentTurn !== playerColor ? "Their Turn" : "Waiting"}
                </Badge>
              </div>
            </Card>

            {/* Chess Board and Captured Pieces */}
            <div className="space-y-4">
              <ChessBoard
                board={board}
                playerColor={playerColor}
                onMove={sendMove}
              />
            </div>

            {/* Player Info */}
            <Card className="p-2 bg-card border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      You ({playerColor})
                    </p>
                    <CapturedPieces color={playerColor} />
                  </div>
                </div>
                <Badge
                  variant={
                    currentTurn === playerColor ? "default" : "secondary"
                  }
                >
                  {currentTurn === playerColor ? "Your Turn" : "Waiting"}
                </Badge>
              </div>
            </Card>
          </div>

          {/* Move History - Hidden on mobile */}
          <div className="hidden lg:block">
            <MoveHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
