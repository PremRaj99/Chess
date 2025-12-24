"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { pieceSymbols } from "./chess-pieces";
import { Piece, PlayerColor } from "@/app/game/page";

interface ChessBoardProps {
  board: Piece[][];
  playerColor: PlayerColor;
  onMove: (from: string, to: string) => void;
}

export function ChessBoard({ board, playerColor, onMove }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] =
    useState<[number, number] | null>(null);

  const [dragSource, setDragSource] =
    useState<[number, number] | null>(null);

  const displayBoard =
    playerColor === "black"
      ? [...board].reverse().map((r) => [...r].reverse())
      : board;

  function toActualIndex(row: number, col: number): [number, number] {
    return playerColor === "black"
      ? [7 - row, 7 - col]
      : [row, col];
  }

  function indexToAlgebraic(row: number, col: number) {
    return `${String.fromCharCode(97 + col)}${8 - row}`;
  }

  /* ---------------- CLICK MOVE ---------------- */

  const handleSquareClick = (row: number, col: number) => {
    if (dragSource) return;

    const [actualRow, actualCol] = toActualIndex(row, col);

    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;

      onMove(
        indexToAlgebraic(fromRow, fromCol),
        indexToAlgebraic(actualRow, actualCol)
      );

      setSelectedSquare(null);
      return;
    }

    if (board[actualRow][actualCol]) {
      setSelectedSquare([actualRow, actualCol]);
    }
  };

  /* ---------------- DRAG & DROP ---------------- */

  const handleDragStart = (
    e: React.DragEvent,
    row: number,
    col: number
  ) => {
    const [actualRow, actualCol] = toActualIndex(row, col);
    if (!board[actualRow][actualCol]) {
      e.preventDefault();
      return;
    }

    setDragSource([actualRow, actualCol]);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent,
    row: number,
    col: number
  ) => {
    e.preventDefault();
    if (!dragSource) return;

    const [fromRow, fromCol] = dragSource;
    const [toRow, toCol] = toActualIndex(row, col);

    onMove(
      indexToAlgebraic(fromRow, fromCol),
      indexToAlgebraic(toRow, toCol)
    );

    setDragSource(null);
    setSelectedSquare(null);
  };

  const handleDragEnd = () => {
    setDragSource(null);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="aspect-square h-[75vh] mx-auto">
      <div className="grid grid-cols-8 border-2 border-border rounded-lg overflow-hidden shadow-xl">
        {displayBoard.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const [actualRow, actualCol] = toActualIndex(rowIndex, colIndex);

            const isSelected =
              selectedSquare?.[0] === actualRow &&
              selectedSquare?.[1] === actualCol;

            const isDragSource =
              dragSource?.[0] === actualRow &&
              dragSource?.[1] === actualCol;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                className={cn(
                  "aspect-square flex items-center justify-center text-5xl transition-colors",
                  isLight ? "bg-[#e4e2c5]" : "bg-[#3c8116]",
                  isSelected && "ring-4 ring-primary ring-inset",
                  isDragSource && "opacity-50",
                  "hover:brightness-90"
                )}
              >
                {piece && (
                  <span
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, rowIndex, colIndex)
                    }
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "cursor-grab active:cursor-grabbing select-none",
                      piece.color === "white"
                        ? "text-white text-outline-black"
                        : "text-stone-900! text-outline-white"
                    )}
                  >
                    {pieceSymbols[piece.color][piece.type]}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
