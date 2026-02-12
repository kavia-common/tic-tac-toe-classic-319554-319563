import React, { useMemo, useState } from "react";
import "./App.css";

const PLAYER_X = "X";
const PLAYER_O = "O";

const WINNING_LINES = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Cols
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

// PUBLIC_INTERFACE
function App() {
  /** Classic local 2-player Tic Tac Toe (3x3). */
  const [board, setBoard] = useState(() => Array(9).fill(null));
  const [nextPlayer, setNextPlayer] = useState(PLAYER_X);

  const gameState = useMemo(() => getGameState(board), [board]);

  const statusText = useMemo(() => {
    if (gameState.status === "won") return `Winner: ${gameState.winner}`;
    if (gameState.status === "draw") return "It’s a draw.";
    return `Next turn: ${nextPlayer}`;
  }, [gameState.status, gameState.winner, nextPlayer]);

  const statusMeta = useMemo(() => {
    if (gameState.status === "playing") return "Click an empty square to place your mark.";
    if (gameState.status === "won") return "Press Restart to play again.";
    return "No more moves left — press Restart to play again.";
  }, [gameState.status]);

  const isGameOver = gameState.status !== "playing";

  // PUBLIC_INTERFACE
  function handleSquareClick(index) {
    /** Places current player's mark on an empty square (if game is still active). */
    setBoard((prev) => {
      if (isGameOver) return prev;
      if (prev[index] !== null) return prev;

      const next = [...prev];
      next[index] = nextPlayer;
      return next;
    });

    // Only toggle player if move is valid. We can detect validity by reading current board.
    // This keeps state updates predictable while remaining simple.
    setNextPlayer((prevNext) => {
      if (isGameOver) return prevNext;
      if (board[index] !== null) return prevNext;
      return prevNext === PLAYER_X ? PLAYER_O : PLAYER_X;
    });
  }

  // PUBLIC_INTERFACE
  function restartGame() {
    /** Resets the board and sets next player to X. */
    setBoard(Array(9).fill(null));
    setNextPlayer(PLAYER_X);
  }

  return (
    <div className="App">
      <main className="ttt-shell">
        <section className="ttt-card" aria-label="Tic Tac Toe game">
          <header className="ttt-header">
            <h1 className="ttt-title">Tic Tac Toe</h1>
            <p className="ttt-subtitle">Classic 3×3 • Two players on the same device</p>

            <div className="ttt-status" role="status" aria-live="polite">
              <div>
                <p className="ttt-statusText">{statusText}</p>
                <p className="ttt-statusMeta">{statusMeta}</p>
              </div>

              {gameState.status === "playing" ? (
                <span className={`badge ${nextPlayer === PLAYER_X ? "badge-x" : "badge-o"}`}>
                  {nextPlayer === PLAYER_X ? "Player X" : "Player O"}
                </span>
              ) : (
                <span className={`badge ${gameState.winner === PLAYER_X ? "badge-x" : "badge-o"}`}>
                  {gameState.status === "draw" ? "Draw" : `${gameState.winner} wins`}
                </span>
              )}
            </div>
          </header>

          <div className="ttt-boardWrap">
            <div className="ttt-board" role="grid" aria-label="3 by 3 board">
              {board.map((value, idx) => {
                const isWinningSquare =
                  gameState.status === "won" && gameState.winningLine?.includes(idx);

                const className = [
                  "square",
                  value === PLAYER_X ? "x" : "",
                  value === PLAYER_O ? "o" : "",
                  isWinningSquare ? "win" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                const label = value
                  ? `Square ${idx + 1}, ${value}`
                  : `Square ${idx + 1}, empty`;

                return (
                  <button
                    key={idx}
                    type="button"
                    className={className}
                    onClick={() => handleSquareClick(idx)}
                    disabled={isGameOver || value !== null}
                    role="gridcell"
                    aria-label={label}
                  >
                    {value ?? <span className="srOnly">Empty</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ttt-actions">
            <button type="button" className="btn btn-primary" onClick={restartGame}>
              Restart
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function getGameState(board) {
  /**
   * Computes current game state from the board.
   * @param {Array<("X"|"O"|null)>} board 9-length array.
   * @returns {{status:"playing"|"won"|"draw", winner:("X"|"O"|null), winningLine:(number[]|null)}}
   */
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const v = board[a];
    if (v && v === board[b] && v === board[c]) {
      return { status: "won", winner: v, winningLine: line };
    }
  }

  const isFull = board.every((cell) => cell !== null);
  if (isFull) return { status: "draw", winner: null, winningLine: null };

  return { status: "playing", winner: null, winningLine: null };
}

export default App;
