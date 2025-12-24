"use client";

import { PieceColor, pieceSymbols } from "./chess-pieces";
import { cn } from "../lib/utils";
import { Piece } from "@/app/game/page";

interface CapturedPiecesProps {
  color: PieceColor;
  capturedPieces: Piece[];
}

const capturedPieceSymbols = {
  white: [
    pieceSymbols.white.pawn,
    pieceSymbols.white.pawn,
    pieceSymbols.white.knight,
    pieceSymbols.white.bishop,
    pieceSymbols.white.rook,
    pieceSymbols.white.queen,
  ],
  black: [
    pieceSymbols.black.pawn,
    pieceSymbols.black.pawn,
    pieceSymbols.black.knight,
    pieceSymbols.black.bishop,
    pieceSymbols.black.rook,
    pieceSymbols.black.queen,
  ],
};

export function CapturedPieces({
  color,
  capturedPieces,
}: CapturedPiecesProps & { capturedPieces: Piece[] }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-wrap gap-1">
        {capturedPieces.map((piece, index) => (
          <span
            key={index}
            className={cn(
              "text-lg opacity-60",
              color === "black"
                ? " text-white  text-outline-black "
                : " text-stone-900! text-outline-white"
            )}
          >
            {piece?.type && ["pawn", "knight", "bishop", "rook", "queen"].includes(piece.type)
              ? capturedPieceSymbols[color][
                  ["pawn", "knight", "bishop", "rook", "queen"].indexOf(
                    piece.type
                  )
                ]
              : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
