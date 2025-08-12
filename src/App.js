import { useState, useEffect } from 'react';
import { useRef } from 'react';
import placementSound from './placementsound.ogg';
import winnerSound from './message.ogg';
import bgMusic from './doodle.mp3';
import resetPressed from './Menu Confirm.mp3';
import compSoundFile from './lowRing.wav';


// A single square on the board
function Square({ value, onSquareClick }) {
  return (
    <button
     className="h-16 w-16 border-4 border-blue-600 bg-white flex items-center justify-center"

      onClick={onSquareClick}
    >
      {value && (
        <span className="text-3xl font-bold pop-up">
          {value === 'X' ? '✕' : '◯'}
        </span>
      )}
    </button>
  );
}


export default function Board() {
  // State: board squares and whose turn it is.
  // Human is "X" and goes first; computer is "O".
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const audioRef = useRef(new Audio(placementSound));
  const winAudio = useRef(new Audio(winnerSound));
  const bgAudio = useRef(new Audio(bgMusic));
  const clickAudio = useRef(new Audio(resetPressed));
  const compAudio = useRef(new Audio(compSoundFile));


  bgAudio.current.volume = 0.4;        // soft background music
  clickAudio.current.volume = 0.9;     // louder click feedback

  // Loop the background track
  bgAudio.current.loop = true;
  
  const [hasStarted, setHasStarted] = useState(false);


  // Calculate the winner on every render.
  const winner = calculateWinner(squares);
  // 1️⃣ Detect a draw (no winner & no null squares)
  const isDraw = !winner && squares.every(square => square !== null);

  // 2️⃣ Reset helper — clears the board and gives X the first turn
  function resetGame() {
    clickAudio.current.currentTime = 0;
    clickAudio.current.play();
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setHasStarted(false);
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  
  }

  // useEffect: triggers when squares, xIsNext, or winner change.
  // If it's computer's turn (xIsNext is false) and the game isn’t over,
  // the computer makes its move.
  useEffect(() => {
    // If there's already a winner or it's human's turn, do nothing.
    if (winner || xIsNext) return;

    // Find all empty squares: return an array of indices where squares[i] is null.
    const emptyIndices = squares
      .map((val, idx) => (val === null ? idx : null))
      .filter(idx => idx !== null);

    // If no empty squares remain, exit.
    if (emptyIndices.length === 0) return;

      // Start music on first click
  if (!hasStarted) {
    bgAudio.current.play();
    setHasStarted(true);
  }
    // Pick a random index from the available empty ones.
    const randomIndex =
      emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

    // Set a short delay to simulate "thinking" time.
    const timer = setTimeout(() => {




      // Copy the current board.
      const nextSquares = squares.slice();
      // Mark the random empty square with "O".
      nextSquares[randomIndex] = 'O';
      // Update state with the new board.
      setSquares(nextSquares);
      
      // Play computer move sound
      compAudio.current.currentTime = 0;
      compAudio.current.play();



      // Change turn back to human (X).
      setXIsNext(true);
    }, 750);

    // Clean up the timer if the component unmounts or dependencies change.
    return () => clearTimeout(timer);
  }, [squares, xIsNext, winner]);


  useEffect(() => {
    if (winner) {
      winAudio.current.currentTime = 0;
      winAudio.current.play();
    }
  }, [winner]);



  // Handle a human (X) clicking a square.
  function handleClick(i) {
    // If game is won or the square is occupied, do nothing.
    if (winner || squares[i]) return;

    // If it's not human's turn, ignore the click.
    if (!xIsNext) return;
    audioRef.current.currentTime = 0;   // rewind
    audioRef.current.play();
    // Copy the board and mark the square with "X".
    const nextSquares = squares.slice();
    nextSquares[i] = 'X';
    // Update the board.
    setSquares(nextSquares);
    // Switch turn to computer.
    setXIsNext(false);
  }

  // Prepare status message.
  let status = winner
    ? `WINNER: ${winner}`
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    
  <div className="min-h-screen flex flex-col items-center pt-28 pb-10">
    {/* Title (no border, bigger, medieval font) */}
    <div className="h-[140px] flex items-center justify-center mb-4">
      <h1 className="hero-title text-white text-5xl font-bold font-medieval">
        Ancient Tic-Tac-Toe
      </h1>
    </div>

    {/* Status display */}
    <div className="text-center bg-green-700/80 text-blue-200 font-semibold px-3 py-1 rounded-md border border-blue-600 mb-4 w-max">
      {status}
    </div>

    {/* Game grid */}
    <div className="grid grid-cols-3 gap-1 border-8 border-blue-600 rounded-lg p-1 w-max mx-auto bg-white/80 backdrop-blur">
      {squares.map((value, idx) => (
        <Square
          key={idx}
          value={value}
          onSquareClick={() => handleClick(idx)}
        />
      ))}
    </div>

    {/* Restart button */}
    {(winner || isDraw) && (
      <div className="flex items-center justify-center">
        <button
          className="grid place-items-center mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl shadow-lg transition duration-600 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-300"
          onClick={resetGame}
        >
          Restart Game
        </button>
      </div>
    )}
  </div>
);

  
}

// Helper function to calculate the winner.
// Checks every winning combination and returns "X" or "O" if one exists.
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], // top row
    [3, 4, 5], // middle row
    [6, 7, 8], // bottom row
    [0, 3, 6], // left column
    [1, 4, 7], // middle column
    [2, 5, 8], // right column
    [0, 4, 8], // diagonal from top-left
    [2, 4, 6], // diagonal from top-right
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
