import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trophy, RotateCcw, User, Bot } from 'lucide-react';

type Player = 'X' | 'O' | null;
type GameMode = 'player' | 'computer';
type GameStatus = 'playing' | 'won' | 'draw';

interface GameState {
  board: Player[];
  currentPlayer: Player;
  gameStatus: GameStatus;
  winner: Player;
  gameMode: GameMode;
  score: { x: number; o: number; draws: number };
}

const TicTacToe: React.FC = () => {
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    gameStatus: 'playing',
    winner: null,
    gameMode: 'player',
    score: { x: 0, o: 0, draws: 0 }
  });

  // Winning combinations
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  // Check for winner
  const checkWinner = (board: Player[]): Player => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  // Check if board is full
  const isBoardFull = (board: Player[]): boolean => {
    return board.every(cell => cell !== null);
  };

  // Get available moves for computer AI
  const getAvailableMoves = (board: Player[]): number[] => {
    return board.map((cell, index) => cell === null ? index : null)
                .filter(index => index !== null) as number[];
  };

  // Simple AI strategy
  const getComputerMove = (board: Player[]): number => {
    // 1. Try to win
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] === 'O' && board[b] === 'O' && board[c] === null) return c;
      if (board[a] === 'O' && board[c] === 'O' && board[b] === null) return b;
      if (board[b] === 'O' && board[c] === 'O' && board[a] === null) return a;
    }

    // 2. Block player from winning
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] === 'X' && board[b] === 'X' && board[c] === null) return c;
      if (board[a] === 'X' && board[c] === 'X' && board[b] === null) return b;
      if (board[b] === 'X' && board[c] === 'X' && board[a] === null) return a;
    }

    // 3. Take center if available
    if (board[4] === null) return 4;

    // 4. Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => board[corner] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // 5. Take any available move
    const availableMoves = getAvailableMoves(board);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (gameState.board[index] !== null || gameState.gameStatus !== 'playing') {
      return;
    }

    const newBoard = [...gameState.board];
    newBoard[index] = gameState.currentPlayer;

    const winner = checkWinner(newBoard);
    let newGameStatus: GameStatus = 'playing';
    let newScore = { ...gameState.score };

    if (winner) {
      newGameStatus = 'won';
      if (winner === 'X') newScore.x++;
      else newScore.o++;
      
      toast({
        title: "🎉 Game Won!",
        description: `Player ${winner} wins!`,
      });
    } else if (isBoardFull(newBoard)) {
      newGameStatus = 'draw';
      newScore.draws++;
      
      toast({
        title: "🤝 It's a Draw!",
        description: "Good game! Try again.",
      });
    }

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: gameState.currentPlayer === 'X' ? 'O' : 'X',
      gameStatus: newGameStatus,
      winner,
      score: newScore
    }));
  };

  // Computer move effect
  useEffect(() => {
    if (gameState.gameMode === 'computer' && 
        gameState.currentPlayer === 'O' && 
        gameState.gameStatus === 'playing') {
      
      const timer = setTimeout(() => {
        const computerMove = getComputerMove(gameState.board);
        handleCellClick(computerMove);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.gameMode, gameState.gameStatus]);

  // Reset game
  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      currentPlayer: 'X',
      gameStatus: 'playing',
      winner: null
    }));
  };

  // Reset score
  const resetScore = () => {
    setGameState(prev => ({
      ...prev,
      score: { x: 0, o: 0, draws: 0 }
    }));
  };

  // Change game mode
  const setGameMode = (mode: GameMode) => {
    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      board: Array(9).fill(null),
      currentPlayer: 'X',
      gameStatus: 'playing',
      winner: null
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-pulse-glow">
            Tic Tac Toe
          </h1>
          <p className="text-muted-foreground text-lg">
            Challenge a friend or test your skills against the computer!
          </p>
        </div>

        {/* Game Mode Selection */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant={gameState.gameMode === 'player' ? 'default' : 'outline'}
            size="lg"
            onClick={() => setGameMode('player')}
            className="flex items-center gap-2"
          >
            <User className="h-5 w-5" />
            Player vs Player
          </Button>
          <Button
            variant={gameState.gameMode === 'computer' ? 'default' : 'outline'}
            size="lg"
            onClick={() => setGameMode('computer')}
            className="flex items-center gap-2"
          >
            <Bot className="h-5 w-5" />
            Player vs Computer
          </Button>
        </div>

        {/* Game Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Current Turn: {gameState.currentPlayer}
                </Badge>
                {gameState.gameStatus === 'won' && (
                  <Badge variant="default" className="text-lg px-4 py-2 animate-bounce-in">
                    <Trophy className="h-4 w-4 mr-2" />
                    {gameState.winner} Wins!
                  </Badge>
                )}
                {gameState.gameStatus === 'draw' && (
                  <Badge variant="secondary" className="text-lg px-4 py-2 animate-bounce-in">
                    It's a Draw!
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" onClick={resetGame}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Board */}
        <Card>
          <CardContent className="p-6 flex justify-center">
            <div className="grid grid-cols-3 gap-2 w-72 h-72">
              {gameState.board.map((cell, index) => (
                <Button
                  key={index}
                  variant="game"
                  onClick={() => handleCellClick(index)}
                  disabled={cell !== null || gameState.gameStatus !== 'playing'}
                  className={`
                    w-full h-full flex items-center justify-center text-4xl font-bold rounded-lg
                    ${cell === 'X' ? 'text-primary' : ''}
                    ${cell === 'O' ? 'text-accent' : ''}
                    ${cell ? 'animate-scale-in' : ''}
                  `}
                >
                  {cell}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {gameState.score.x}
                </div>
                <div className="text-sm text-muted-foreground">Player X</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-muted-foreground">
                  {gameState.score.draws}
                </div>
                <div className="text-sm text-muted-foreground">Draws</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-accent">
                  {gameState.score.o}
                </div>
                <div className="text-sm text-muted-foreground">
                  {gameState.gameMode === 'computer' ? 'Computer' : 'Player O'}
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" onClick={resetScore}>
                Reset Score
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicTacToe;