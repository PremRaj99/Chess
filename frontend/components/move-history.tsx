"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const sampleMoves = [
  { number: 1, white: "e4", black: "e5" },
  { number: 2, white: "Nf3", black: "Nc6" },
  { number: 3, white: "Bb5", black: "a6" },
  { number: 4, white: "Ba4", black: "Nf6" },
  { number: 5, white: "O-O", black: "Be7" },
  { number: 6, white: "Re1", black: "b5" },
  { number: 7, white: "Bb3", black: "d6" },
  { number: 8, white: "c3", black: "O-O" },
]

export function MoveHistory() {
  return (
    <Card className="h-full bg-card border-border">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Move History</h3>
      </div>
      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="p-4 space-y-2">
          {sampleMoves.map((move) => (
            <div
              key={move.number}
              className="grid grid-cols-[40px_1fr_1fr] gap-2 py-2 border-b border-border/50 last:border-0"
            >
              <span className="text-sm font-medium text-muted-foreground">{move.number}.</span>
              <span className="text-sm font-mono text-foreground">{move.white}</span>
              <span className="text-sm font-mono text-foreground">{move.black}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
