import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(false); // Tesla (X) goes first (AI)
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, draw
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ tesla: 0, einstein: 0, draws: 0 });

  // Winning combinations
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  // Check for winner
  const checkWinner = (board) => {
    for (let combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  // Check if board is full
  const isBoardFull = (board) => {
    return board.every(cell => cell !== null);
  };

  // Minimax algorithm for unbeatable AI
  const minimax = (board, depth, isMaximizing) => {
    const winner = checkWinner(board);
    
    // Terminal states
    if (winner === 'X') return 10 - depth; // AI wins (prefer quicker wins)
    if (winner === 'O') return depth - 10; // Player wins (prefer slower losses)
    if (isBoardFull(board)) return 0; // Draw

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const score = minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const score = minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  // Get best move for AI
  const getBestMove = (board) => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = minimax(board, 0, false);
        board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  // Handle player move
  const handleCellClick = (index) => {
    if (board[index] || gameStatus !== 'playing' || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'O'; // Einstein (player)
    setBoard(newBoard);
    setIsPlayerTurn(false);

    // Check game end
    const winner = checkWinner(newBoard);
    if (winner) {
      setGameStatus('won');
      setWinner(winner);
      if (winner === 'O') {
        setScores(prev => ({ ...prev, einstein: prev.einstein + 1 }));
      }
    } else if (isBoardFull(newBoard)) {
      setGameStatus('draw');
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
  };

  // AI move effect
  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const newBoard = [...board];
        const bestMove = getBestMove(newBoard);
        
        if (bestMove !== -1) {
          newBoard[bestMove] = 'X'; // Tesla (AI)
          setBoard(newBoard);
          setIsPlayerTurn(true);

          // Check game end
          const winner = checkWinner(newBoard);
          if (winner) {
            setGameStatus('won');
            setWinner(winner);
            if (winner === 'X') {
              setScores(prev => ({ ...prev, tesla: prev.tesla + 1 }));
            }
          } else if (isBoardFull(newBoard)) {
            setGameStatus('draw');
            setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
          }
        }
      }, 500); // Small delay for better UX

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameStatus, board]);

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(false); // Tesla (AI) always starts
    setGameStatus('playing');
    setWinner(null);
  };

  // Reset scores
  const resetScores = () => {
    setScores({ tesla: 0, einstein: 0, draws: 0 });
  };

  // Get cell display
  const getCellContent = (cell) => {
    if (cell === 'X') return '🚛'; // Tesla truck
    if (cell === 'O') return '🧠'; // Einstein brain
    return '';
  };

  // Get game status message
  const getStatusMessage = () => {
    if (gameStatus === 'won') {
      return winner === 'X' 
        ? '🚛 Tesla Wins! The AI is unbeatable!' 
        : '🧠 Einstein Wins! Incredible!';
    }
    if (gameStatus === 'draw') {
      return '🤝 It\'s a Draw! Great match!';
    }
    return isPlayerTurn 
      ? '🧠 Einstein\'s Turn (Your Move)' 
      : '🚛 Tesla is Thinking...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            <span className="text-blue-400">🧠 Einstein</span>
            <span className="text-gray-400 mx-4">vs</span>
            <span className="text-red-400">Tesla 🚛</span>
          </h1>
          <p className="text-gray-300 text-sm">The Ultimate Battle of Minds</p>
        </div>

        {/* Scoreboard */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700">
          <div className="flex justify-between items-center text-sm">
            <div className="text-center">
              <div className="text-blue-400 font-semibold">🧠 Einstein</div>
              <div className="text-2xl font-bold text-white">{scores.einstein}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 font-semibold">Draws</div>
              <div className="text-xl font-bold text-gray-300">{scores.draws}</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 font-semibold">Tesla 🚛</div>
              <div className="text-2xl font-bold text-white">{scores.tesla}</div>
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="text-center mb-6">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-700">
            <p className="text-white font-medium">{getStatusMessage()}</p>
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-2xl">
          <div className="grid grid-cols-3 gap-3 mb-6">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                className={`
                  aspect-square rounded-xl text-4xl font-bold transition-all duration-200
                  border-2 backdrop-blur-sm
                  ${cell 
                    ? 'bg-gray-800/50 border-gray-600 cursor-default' 
                    : 'bg-gray-900/50 border-gray-700 hover:bg-gray-700/50 hover:border-gray-500 cursor-pointer active:scale-95'
                  }
                  ${!isPlayerTurn && gameStatus === 'playing' && !cell ? 'cursor-not-allowed opacity-60' : ''}
                  flex items-center justify-center
                `}
                disabled={!isPlayerTurn || gameStatus !== 'playing' || cell}
              >
                {getCellContent(cell)}
              </button>
            ))}
          </div>

          {/* Game Controls */}
          <div className="flex gap-3">
            <button
              onClick={resetGame}
              className="flex-1 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 active:scale-95"
            >
              New Game
            </button>
            <button
              onClick={resetScores}
              className="flex-1 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 active:scale-95"
            >
              Reset Scores
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-xs">
            Tesla AI uses advanced algorithms - Can you outsmart it? 🤖
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;