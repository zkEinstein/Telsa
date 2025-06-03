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
    setTimeout(() => setSoundEffect(''), 1200);
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

    playSound('NEURAL_CLICK');
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
        playSound('HUMAN_VICTORY');
      }
      setTimeout(() => setShowVictoryEffect(false), 3000);
    } else if (isBoardFull(newBoard)) {
      setGameStatus('draw');
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      playSound('SYSTEM_DRAW');
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
          playSound('AI_COMPUTE');

          // Check game end
          const result = checkWinner(newBoard);
          if (result) {
            setGameStatus('won');
            setWinner(result.winner);
            setWinningLine(result.line);
            setShowVictoryEffect(true);
            if (result.winner === 'X') {
              setScores(prev => ({ ...prev, tesla: prev.tesla + 1 }));
              playSound('AI_DOMINANCE');
            }
            setTimeout(() => setShowVictoryEffect(false), 3000);
          } else if (isBoardFull(newBoard)) {
            setGameStatus('draw');
            setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
            playSound('SYSTEM_DRAW');
          }
        }
      }, 1500); // Extended for dramatic cyberpunk effect

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
    playSound('SYSTEM_RESET');
  };

  // Reset scores
  const resetScores = () => {
    setScores({ tesla: 0, einstein: 0, draws: 0 });
    playSound('DATA_PURGE');
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
        ? '🏆 TESLA PROTOCOL EXECUTED - AI SUPREMACY ACHIEVED' 
        : '🎉 EINSTEIN ALGORITHM BREAKTHROUGH - HUMAN INTELLECT PREVAILS';
    }
    if (gameStatus === 'draw') {
      return '🤝 QUANTUM EQUILIBRIUM REACHED - STALEMATE PROTOCOL ACTIVE';
    }
    if (isAiThinking) {
      return '🤖 TESLA NEURAL NETWORK PROCESSING... CALCULATING OPTIMAL STRATEGY';
    }
    return isPlayerTurn 
      ? '🧠 EINSTEIN INTERFACE ACTIVE - INPUT YOUR STRATEGIC COORDINATES' 
      : '🚛 TESLA AI INITIALIZING FIRST MOVE SEQUENCE...';
  };

  // Get sound effect text
  const getSoundText = (type) => {
    const sounds = {
      'NEURAL_CLICK': 'NEURAL CLICK',
      'AI_COMPUTE': 'AI COMPUTE',
      'HUMAN_VICTORY': 'HUMAN VICTORY',
      'AI_DOMINANCE': 'AI DOMINANCE', 
      'SYSTEM_DRAW': 'SYSTEM DRAW',
      'SYSTEM_RESET': 'SYSTEM RESET',
      'DATA_PURGE': 'DATA PURGE'
    };
    return sounds[type] || type;
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
    <div className={`min-h-screen cyberpunk-bg flex items-center justify-center p-4 transition-all duration-500 ${showVictoryEffect ? 'cyber-victory' : ''}`}>
      {/* Cyberpunk Particle Effects */}
      {showVictoryEffect && (
        <div className="particle-container">
          <div className="cyber-particles"></div>
        </div>
      )}
      
      {/* Cyberpunk Sound Effect Indicator */}
      {soundEffect && (
        <div className="fixed top-4 right-4 cyber-sound text-black px-4 py-2 rounded text-sm font-bold z-50">
          ⚡ {getSoundText(soundEffect)}
        </div>
      )}

      <div className="w-full max-w-md mx-auto">
        {/* Cyberpunk Header */}
        <div className="text-center mb-8">
          <h1 className="cyber-title text-3xl md:text-4xl mb-3" data-text="EINSTEIN VS TESLA">
            <span className="cyber-einstein">Einstein</span>
            <span className="cyber-vs mx-4 text-2xl md:text-3xl">vs</span>
            <span className="cyber-tesla">Tesla</span>
          </h1>
          <p className="text-cyan-300 text-sm font-bold tracking-wider" style={{fontFamily: 'Orbitron'}}>
            ⚡ NEURAL WARFARE PROTOCOL ACTIVATED ⚡
          </p>
        </div>

        {/* Cyberpunk Scoreboard */}
        <div className="holo-panel neon-scoreboard rounded-lg p-5 mb-6">
          <div className="flex justify-between items-center text-sm">
            <div className="text-center">
              <div className="text-cyan-400 font-bold text-lg" style={{fontFamily: 'Orbitron'}}>🧠 EINSTEIN</div>
              <div className="text-4xl font-bold text-white counter-animate" style={{fontFamily: 'Orbitron'}}>{scores.einstein}</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-bold" style={{fontFamily: 'Orbitron'}}>⭐ DRAWS</div>
              <div className="text-2xl font-bold text-gray-300 counter-animate" style={{fontFamily: 'Orbitron'}}>{scores.draws}</div>
            </div>
            <div className="text-center">
              <div className="text-magenta-400 font-bold text-lg" style={{fontFamily: 'Orbitron', color: 'var(--neon-magenta)'}}>TESLA 🚛</div>
              <div className="text-4xl font-bold text-white counter-animate" style={{fontFamily: 'Orbitron'}}>{scores.tesla}</div>
            </div>
          </div>
        </div>

        {/* Cyberpunk Game Status */}
        <div className="text-center mb-6">
          <div className={`holo-panel rounded-lg px-6 py-4 ${isAiThinking ? 'ai-thinking' : ''}`}>
            <p className="text-white font-bold text-sm leading-relaxed" style={{fontFamily: 'Orbitron'}}>
              {getStatusMessage()}
            </p>
          </div>
        </div>

        {/* Cyberpunk Game Board */}
        <div className="relative cyber-board rounded-xl p-6 mb-6">
          {/* Cyberpunk Winning Line SVG */}
          {winningLine && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 300 300"
              style={{ padding: '24px' }}
            >
              <line
                {...getLineCoordinates(winningLine)}
                stroke={winner === 'X' ? 'var(--neon-magenta)' : 'var(--neon-cyan)'}
                className="cyber-winning-line"
              />
            </svg>
          )}
          
          <div className="grid grid-cols-3 gap-3 mb-6 relative">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                className={`
                  aspect-square rounded-lg text-4xl font-bold transition-all duration-300
                  cyber-cell flex items-center justify-center relative overflow-hidden
                  ${cell ? 'cyber-cell-filled cursor-default' : 'cursor-pointer active:scale-95'}
                  ${!isPlayerTurn && gameStatus === 'playing' && !cell ? 'cursor-not-allowed opacity-60' : ''}
                  ${lastMove === index ? 'cyber-cell-last-move' : ''}
                  ${winningLine?.includes(index) ? 'cyber-cell-winning' : ''}
                `}
                disabled={!isPlayerTurn || gameStatus !== 'playing' || cell}
              >
                <span className={`${cell ? 'cyber-symbol' : ''}`}>
                  {getCellContent(cell)}
                </span>
                {!cell && isPlayerTurn && gameStatus === 'playing' && (
                  <span className="cyber-preview absolute">🧠</span>
                )}
              </button>
            ))}
          </div>

          {/* Cyberpunk Game Controls */}
          <div className="flex gap-3">
            <button
              onClick={resetGame}
              className="flex-1 cyber-button text-white font-bold py-4 px-4 rounded-lg"
            >
              🎮 INITIALIZE NEW BATTLE
            </button>
            <button
              onClick={resetScores}
              className="flex-1 cyber-button text-white font-bold py-4 px-4 rounded-lg"
            >
              🔄 PURGE DATA LOGS
            </button>
          </div>
        </div>

        {/* Cyberpunk Footer */}
        <div className="text-center">
          <p className="text-cyan-400 text-xs font-bold tracking-wide" style={{fontFamily: 'Orbitron'}}>
            🤖 TESLA NEURAL MATRIX v2.0 - UNBREAKABLE QUANTUM ALGORITHMS ⚡
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;