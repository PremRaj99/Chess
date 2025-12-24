type messageTypes =
    { type: "error", message: string }
    | { type: "init_game", message: string }
    | { type: "move", move: { from: string, to: string, captured: { type: string, color: "white" | "black" } | null, capturedOn: string | null, promotion: string | null }, nextTurn: "white" | "black" }
    | { type: "game_over", message: string }
    | { type: "game_draw", message: string }
    | { type: "game_check", message: string };