import WebSocket from 'ws';

const WS_URL = "ws://localhost:8080";

async function setupWs(ws1Messages: any[] = [], ws2Messages: any[] = []) {
  const ws1 = new WebSocket(WS_URL);

  ws1.onmessage = (event: any) => {
    ws1Messages.push(JSON.parse(event.data));
  };

  await new Promise((r) => {
    ws1.onopen = r;
  });

  const ws2 = new WebSocket(WS_URL);

  ws2.onmessage = (event: any) => {
    ws2Messages.push(JSON.parse(event.data));
  };

  await new Promise((r) => {
    ws2.onopen = r;
  });

  return { ws1, ws2 };
}

async function waitForAndPopLatestMessage(messageArray: any[]): Promise<any> {
  return new Promise((resolve) => {
    if (messageArray.length > 0) {
      resolve(messageArray.shift());
    } else {
      let interval = setInterval(() => {
        if (messageArray.length > 0) {
          resolve(messageArray.shift());
          clearInterval(interval);
        }
      }, 100);
    }
  });
}

describe("Test Web socket connection", () => {
  test.skip("should connect to the WebSocket server", async () => {
    const ws = new WebSocket("ws://localhost:8080");

    await new Promise<void>((resolve, reject) => {
      ws.on("open", () => {
        resolve();
      });
      ws.on("error", (err) => {
        reject(err);
      });
    });

    expect(ws.readyState).toBe(WebSocket.OPEN);

    // Properly close and wait for connection to terminate
    await new Promise<void>((resolve) => {
      ws.on("close", () => {
        resolve();
      });
      ws.close();
    });
  });

  test.skip("should receive a message from the WebSocket server", async () => {
    const ws = new WebSocket("ws://localhost:8080");
    const testMessage = { type: "init_game" };

    await new Promise<void>((resolve, reject) => {
      ws.on("open", () => {
        ws.send(JSON.stringify(testMessage));
      });
      ws.on("message", (message) => {
        // Expect any message from the server (remove strict echo check)
        console.log("\n\n message is : \n\n ", message.toString());
        expect(typeof message.toString()).toBe("string");
        resolve();
      });
      ws.on("error", (err) => {
        reject(err);
      });
    });

    ws.close();
  });

  test.skip("should receive a message from the WebSocket server", async () => {
    const ws1Messages: any[] = [];
    const ws2Messages: any[] = [];
    const { ws1, ws2 } = await setupWs(ws1Messages, ws2Messages);
    ws1.send(JSON.stringify({ type: "init_game" }));
    const msg1 = await waitForAndPopLatestMessage(ws1Messages);
    ws2.send(JSON.stringify({ type: "init_game" }));
    const msg2 = await waitForAndPopLatestMessage(ws2Messages);
    const msg3 = await waitForAndPopLatestMessage(ws1Messages);
    const testMessage = { type: "move", move: { from: "e2", to: "e4" } };

    ws1.send(JSON.stringify(testMessage));
    let msg2Move;
    if (
      msg3 &&
      msg3.type === 'init_game' &&
      msg3.message === 'You are White'
    ) {
      msg2Move = await waitForAndPopLatestMessage(ws2Messages);
    } else {
      msg2Move = await waitForAndPopLatestMessage(ws1Messages);
    }
    console.log("here 8", msg2Move)
    expect(msg2Move).toBeDefined();
    ws1.close();
    ws2.close();
  });

  test.skip("check the checkmate", async () => {
    const ws1Messages: any[] = [];
    const ws2Messages: any[] = [];
    const { ws1, ws2 } = await setupWs(ws1Messages, ws2Messages);
    ws1.send(JSON.stringify({ type: "init_game" }));
    const ms1 = await waitForAndPopLatestMessage(ws1Messages);
    console.log("Message 1: ", ms1);
    ws2.send(JSON.stringify({ type: "init_game" }));
    const ms2 = await waitForAndPopLatestMessage(ws2Messages);
    console.log("Message 2: ", ms2);
    const ms4 = await waitForAndPopLatestMessage(ws1Messages);
    console.log("Message 4: ", ms4);
    const moves = [
      { from: "e2", to: "e4" },
      { from: "e7", to: "e5" },
      { from: "d1", to: "h5" },
      { from: "b8", to: "c6" },
      { from: "f1", to: "c4" },
      { from: "g8", to: "f6" },
      { from: "h5", to: "f7" }, // checkmate move
    ];
    for (let i = 0; i < moves.length; i++) {
      const moveMessage = { type: "move", move: moves[i] };
      if (i % 2 === 0) {
        ws1.send(JSON.stringify(moveMessage));
        const message = await waitForAndPopLatestMessage(ws2Messages);
        console.log("message ", i, " = ", message)
      } else {
        ws2.send(JSON.stringify(moveMessage));
        const message = await waitForAndPopLatestMessage(ws1Messages);
        console.log("message ", i, " = ", message)
      }
    }
    const finalMsg = await waitForAndPopLatestMessage(
      ws1Messages.length > 0 ? ws1Messages : ws2Messages
    );
    expect(finalMsg.type).toBe("game_over");
    expect(finalMsg.message).toBe("White is the Winner");
    ws1.close();
    ws2.close();
  });

  test("check the draw", async () => {
    const ws1Messages: any[] = [];
    const ws2Messages: any[] = [];
    const { ws1, ws2 } = await setupWs(ws1Messages, ws2Messages);
    ws1.send(JSON.stringify({ type: "init_game" }));
    await waitForAndPopLatestMessage(ws1Messages);
    ws2.send(JSON.stringify({ type: "init_game" }));
    await waitForAndPopLatestMessage(ws2Messages);
    await waitForAndPopLatestMessage(ws1Messages);
    const moves = [
      { from: "g1", to: "f3" },
      { from: "g8", to: "f6" },

      { from: "f3", to: "g1" },
      { from: "f6", to: "g8" },

      { from: "g1", to: "f3" },
      { from: "g8", to: "f6" },

      { from: "f3", to: "g1" },
      { from: "f6", to: "g8" },

      { from: "g1", to: "f3" },
      { from: "g8", to: "f6" }
    ];

    for (let i = 0; i < moves.length; i++) {
      const moveMessage = { type: "move", move: moves[i] };
      if (i % 2 === 0) {
        ws1.send(JSON.stringify(moveMessage));
        await waitForAndPopLatestMessage(ws2Messages);
      } else {
        ws2.send(JSON.stringify(moveMessage));
        await waitForAndPopLatestMessage(ws1Messages);
      }
    }
    const finalMsg = await waitForAndPopLatestMessage(
      ws1Messages.length > 0 ? ws1Messages : ws2Messages
    );
    expect(finalMsg.type).toBe("game_draw");
    expect(finalMsg.message).toBe("Game is a draw");
    ws1.close();
    ws2.close();
  });
});
