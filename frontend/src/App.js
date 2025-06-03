import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(false); // Tesla (X) goes first (AI)
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, draw
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ tesla: 0, einstein: 0, draws: 0 });
  const [winningLine, setWinningLine] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [showVictoryEffect, setShowVictoryEffect] = useState(false);
  const [soundEffect, setSoundEffect] = useState('');

  // Winning combinations
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  // Check for winner and return winning line
  const checkWinner = (board) => {
    for (let combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: combo };
      }
    }
    return null;
  };

  // Check if board is full
  const isBoardFull = (board) => {
    return board.every(cell => cell !== null);
  };

  // Play sound effect (visual indicator)
  const playSound = (type) => {
    setSoundEffect(type);
    setTimeout(() => setSoundEffect(''), 1000);
  };

  // Minimax algorithm for unbeatable AI
  const minimax = (board, depth, isMaximizing) => {
    const result = checkWinner(board);
    
    // Terminal states
    if (result?.winner === 'X') return 10 - depth; // AI wins (prefer quicker wins)
    if (result?.winner === 'O') return depth - 10; // Player wins (prefer slower losses)
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

    playSound('click');
    const newBoard = [...board];
    newBoard[index] = 'O'; // Einstein (player)
    setBoard(newBoard);
    setLastMove(index);
    setIsPlayerTurn(false);

    // Check game end
    const result = checkWinner(newBoard);
    if (result) {
      setGameStatus('won');
      setWinner(result.winner);
      setWinningLine(result.line);
      setShowVictoryEffect(true);
      if (result.winner === 'O') {
        setScores(prev => ({ ...prev, einstein: prev.einstein + 1 }));
        playSound('victory');
      }
      setTimeout(() => setShowVictoryEffect(false), 2000);
    } else if (isBoardFull(newBoard)) {
      setGameStatus('draw');
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      playSound('draw');
    }
  };

  // AI move effect
  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'playing') {
      setIsAiThinking(true);
      
      const timer = setTimeout(() => {
        const newBoard = [...board];
        const bestMove = getBestMove(newBoard);
        
        if (bestMove !== -1) {
          newBoard[bestMove] = 'X'; // Tesla (AI)
          setBoard(newBoard);
          setLastMove(bestMove);
          setIsPlayerTurn(true);
          setIsAiThinking(false);
          playSound('aiMove');

          // Check game end
          const result = checkWinner(newBoard);
          if (result) {
            setGameStatus('won');
            setWinner(result.winner);
            setWinningLine(result.line);
            setShowVictoryEffect(true);
            if (result.winner === 'X') {
              setScores(prev => ({ ...prev, tesla: prev.tesla + 1 }));
              playSound('aiVictory');
            }
            setTimeout(() => setShowVictoryEffect(false), 2000);
          } else if (isBoardFull(newBoard)) {
            setGameStatus('draw');
            setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
            playSound('draw');
          }
        }
      }, 1000); // Longer delay for dramatic effect

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameStatus, board]);

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(false); // Tesla (AI) always starts
    setGameStatus('playing');
    setWinner(null);
    setWinningLine(null);
    setLastMove(null);
    setIsAiThinking(false);
    playSound('reset');
  };

  // Reset scores
  const resetScores = () => {
    setScores({ tesla: 0, einstein: 0, draws: 0 });
    playSound('reset');
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
        ? '🏆 Tesla Dominates! The AI is unbeatable!' 
        : '🎉 Einstein Wins! Absolutely incredible!';
    }
    if (gameStatus === 'draw') {
      return '🤝 Epic Draw! Neither genius could triumph!';
    }
    if (isAiThinking) {
      return '🤖 Tesla is calculating the perfect move...';
    }
    return isPlayerTurn 
      ? '🧠 Einstein\'s Turn - Show your brilliance!' 
      : '🚛 Tesla will make the first move...';
  };

  // Get winning line coordinates for SVG
  const getLineCoordinates = (line) => {
    if (!line) return null;
    
    const positions = {
      0: { x: 50, y: 50 }, 1: { x: 150, y: 50 }, 2: { x: 250, y: 50 },
      3: { x: 50, y: 150 }, 4: { x: 150, y: 150 }, 5: { x: 250, y: 150 },
      6: { x: 50, y: 250 }, 7: { x: 150, y: 250 }, 8: { x: 250, y: 250 }
    };
    
    const start = positions[line[0]];
    const end = positions[line[2]];
    
    return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 transition-all duration-500 ${showVictoryEffect ? 'victory-screen' : ''}`}>
      {/* Particle Effects */}
      {showVictoryEffect && (
        <div className="particle-container">
          <div className="particles"></div>
        </div>
      )}
      
      {/* Sound Effect Indicator */}
      {soundEffect && (
        <div className="fixed top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-semibold z-50 sound-indicator">
          🔊 {soundEffect === 'click' && 'Click!'}
          {soundEffect === 'aiMove' && 'Tesla Move!'}
          {soundEffect === 'victory' && 'Victory!'}
          {soundEffect === 'aiVictory' && 'Tesla Wins!'}
          {soundEffect === 'draw' && 'Draw!'}
          {soundEffect === 'reset' && 'Reset!'}
        </div>
      )}

      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="retro-title text-3xl md:text-4xl mb-2">
            <span className="retro-einstein">Einstein</span>
            <span className="retro-vs mx-4 text-2xl md:text-3xl">vs</span>
            <span className="retro-tesla">Tesla</span>
          </h1>
          <p className="text-gray-300 text-sm font-medium tracking-wide">
            ⚡ The Ultimate Battle of Minds ⚡
          </p>
        </div>

        {/* Scoreboard */}
        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-5 mb-6 border border-gray-600 shadow-2xl score-glow">
          <div className="flex justify-between items-center text-sm">
            <div className="text-center">
              <div className="text-cyan-400 font-bold text-lg">🧠 Einstein</div>
              <div className="text-3xl font-bold text-white counter-animate">{scores.einstein}</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-bold">⭐ Draws</div>
              <div className="text-2xl font-bold text-gray-300 counter-animate">{scores.draws}</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 font-bold text-lg">Tesla 🚛</div>
              <div className="text-3xl font-bold text-white counter-animate">{scores.tesla}</div>
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="text-center mb-6">
          <div className={`bg-black/40 backdrop-blur-lg rounded-lg px-6 py-4 border border-gray-600 shadow-xl ${isAiThinking ? 'ai-thinking-glow' : 'status-glow'}`}>
            <p className={`text-white font-bold text-lg ${isAiThinking ? 'ai-thinking-pulse' : ''}`}>
              {getStatusMessage()}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="relative bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-600 shadow-2xl board-glow">
          {/* Winning Line SVG */}
          {winningLine && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 300 300"
              style={{ padding: '24px' }}
            >
              <line
                {...getLineCoordinates(winningLine)}
                stroke={winner === 'X' ? '#ef4444' : '#06b6d4'}
                strokeWidth="6"
                strokeLinecap="round"
                className="winning-line"
              />
            </svg>
          )}
          
          <div className="grid grid-cols-3 gap-3 mb-6 relative">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                className={`
                  aspect-square rounded-xl text-4xl font-bold transition-all duration-300
                  border-2 backdrop-blur-sm relative overflow-hidden
                  ${cell 
                    ? 'bg-gray-800/60 border-gray-500 cursor-default cell-filled' 
                    : 'bg-gray-900/60 border-gray-600 hover:bg-gray-700/60 hover:border-cyan-400 cursor-pointer active:scale-95 cell-hover-glow'
                  }
                  ${!isPlayerTurn && gameStatus === 'playing' && !cell ? 'cursor-not-allowed opacity-60' : ''}
                  ${lastMove === index ? 'last-move-glow' : ''}
                  ${winningLine?.includes(index) ? 'winning-cell' : ''}
                  flex items-center justify-center cell-3d
                `}
                disabled={!isPlayerTurn || gameStatus !== 'playing' || cell}
              >
                <span className={`cell-content ${cell ? 'symbol-animate' : ''}`}>
                  {getCellContent(cell)}
                </span>
                {!cell && isPlayerTurn && gameStatus === 'playing' && (
                  <span className="preview-symbol">🧠</span>
                )}
              </button>
            ))}
          </div>

          {/* Game Controls */}
          <div className="flex gap-3">
            <button
              onClick={resetGame}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 active:from-purple-800 active:to-purple-900 text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 active:scale-95 button-3d button-glow"
            >
              🎮 New Game
            </button>
            <button
              onClick={resetScores}
              className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-900 active:to-gray-900 text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 active:scale-95 button-3d button-glow"
            >
              🔄 Reset Scores
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-xs font-medium">
            🤖 Tesla's AI uses quantum-level algorithms - Can you outsmart it? ⚡
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;