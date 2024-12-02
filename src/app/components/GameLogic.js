// components/GameLogic.js

export const DIRECTIONS = [[1,0], [0,1], [-1,1], [-1,0], [0,-1], [1,-1]];
export const PIECES = {queen: 1, beetle: 2, spider: 2, grasshopper: 3, ant: 3};

export const calculatePosition = (q, r, hexSize) => ({
    // Adjust x and y offsets to move the center 7 hexagons to the middle
    x: hexSize * (1.73 * q + 0.87 * r) + 400, // Changed from 300 to 400
    y: hexSize * 1.5 * r + 397  // Changed from 300 to 400
  });

export const findPieceAt = (board, q, r, includeAbove = false) => 
  board.filter(x => x.q === q && x.r === r)
    .sort((a, b) => a.z - b.z)[0];

export const findPieceOnTop = (board, q, r) => 
  board.filter(x => x.q === q && x.r === r)
    .sort((a, b) => b.z - a.z)[0];

export const getAdjacentCoords = (q, r) => 
  DIRECTIONS.map(([dq, dr]) => ({q: q + dq, r: r + dr}));

export const countPieces = (board, type, player) => 
  board.filter(x => x.t === type && x.p === player).length;

export const canSlide = (board, from, to) => {
  const isAdjacent = getAdjacentCoords(from.q, from.r)
    .some(p => p.q === to.q && p.r === to.r);
    
  if (from.t === 'beetle') {
    // If beetle is above other pieces (z > 0), it can move to any adjacent hex
    if (from.z > 0 && isAdjacent) {
      return true;
    }
    // If moving to an occupied hex, beetle can always climb it if adjacent
    if (findPieceOnTop(board, to.q, to.r) && isAdjacent) {
      return true;
    }
    // If on ground level (z=0) and moving to empty hex, must follow sliding rules
    const commonNeighbors = getAdjacentCoords(from.q, from.r)
      .filter(p => getAdjacentCoords(to.q, to.r)
        .some(n => n.q === p.q && n.r === p.r));
    
    if (commonNeighbors.length !== 2) return false;
    const occupiedCount = commonNeighbors.filter(p => findPieceAt(board, p.q, p.r)).length;
    return occupiedCount === 1;
  }
  // Non-beetle pieces follow normal sliding rules
  const commonNeighbors = getAdjacentCoords(from.q, from.r)
    .filter(p => getAdjacentCoords(to.q, to.r)
      .some(n => n.q === p.q && n.r === p.r));

  if (commonNeighbors.length !== 2) return false;
  const occupiedCount = commonNeighbors.filter(p => findPieceAt(board, p.q, p.r)).length;
  return occupiedCount === 1;
};

export const isConnected = (board) => {
  if (board.length <= 1) return true;
  
  const groundPieces = board.filter(x => x.z === 0);
  const seen = new Set();
  const toCheck = [groundPieces[0]];
  
  while (toCheck.length) {
    const piece = toCheck.pop();
    const key = `${piece.q},${piece.r}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      getAdjacentCoords(piece.q, piece.r).forEach(n => {
        const neighbor = findPieceAt(board, n.q, n.r);
        if (neighbor && neighbor.z === 0) toCheck.push(neighbor);
      });
    }
  }
  
  return seen.size === groundPieces.length;
};

export const canMove = (board, currentPlayer) => {
    // Can't move until queen is placed
    const hasQueen = board.some(piece => 
      piece.p === currentPlayer && piece.t === 'queen'
    );
    
    return hasQueen;
};

export const canPlace = (board, q, r, type, player, turn) => {
    // For the first placement
    if (!board.length) {
      const distance = Math.abs(q) + Math.abs(r) + Math.abs(-q-r);
      return distance <= 2;
    }
    
    // Get all pieces that aren't covered by beetles
    const uncoveredPieces = board.filter(piece => {
      const pieceOnTop = findPieceOnTop(board, piece.q, piece.r);
      return pieceOnTop.z === piece.z; // Only include if it's the top piece
    });
    
    const neighbors = getAdjacentCoords(q, r)
      .map(n => findPieceOnTop(board, n.q, n.r))
      .filter(x => x);
    
    return neighbors.length > 0 && 
           (uncoveredPieces.length < 2 || neighbors.some(x => x.p === player)) &&
           neighbors.every(x => uncoveredPieces.length < 2 || x.p === player) &&
           countPieces(board, type, player) < PIECES[type] &&
           (turn <= 6 || countPieces(board, 'queen', player) > 0 || type === 'queen');
};

  export const getValidMoves = (board, piece, turn) => {
    if (!piece) return [];

    // First check: can't move any pieces until queen is placed
    const hasQueen = board.some(p => 
        p.p === piece.p && // same player
        p.t === 'queen'    // is queen
    );
    
    if (!hasQueen) return [];

    const moves = new Set();
  
if (piece.t === 'queen' || piece.t === 'beetle') {
  getAdjacentCoords(piece.q, piece.r).forEach(pos => {
    const targetPiece = findPieceOnTop(board, pos.q, pos.r);
    const newZ = piece.t === 'beetle' ? (targetPiece ? targetPiece.z + 1 : 0) : 0;
    
    // NEW: For beetles, only allow move if climbing OR follows sliding rules
    if (piece.t === 'beetle') {
      // Can always climb onto adjacent occupied hexes
      if (targetPiece || canSlide(board, piece, pos)) {
        const newBoard = [...board.filter(x => x !== piece),
          {...piece, q: pos.q, r: pos.r, z: newZ}];
          
        if (isConnected(newBoard)) {
          moves.add(`${pos.q},${pos.r},${newZ}`);
        }
      }
    } else if (!targetPiece && canSlide(board, piece, pos)) { // For queen
      const newBoard = [...board.filter(x => x !== piece),
        {...piece, q: pos.q, r: pos.r, z: newZ}];
        
      if (isConnected(newBoard)) {
        moves.add(`${pos.q},${pos.r},${newZ}`);
      }
    }
  });
}

  if (piece.t === 'ant') {
    const seen = new Set([`${piece.q},${piece.r}`]);
    let positions = [piece];
    
    while (positions.length) {
      const newPositions = [];
      positions.forEach(pos => {
        getAdjacentCoords(pos.q, pos.r).forEach(n => {
          const key = `${n.q},${n.r}`;
          if (!findPieceAt(board, n.q, n.r) && !seen.has(key) && 
              canSlide(board, pos, n)) {
            const newBoard = [...board.filter(x => x !== piece),
              {...piece, q: n.q, r: n.r}];
            if (isConnected(newBoard)) {
              seen.add(key);
              moves.add(`${n.q},${n.r},0`);
              newPositions.push({q: n.q, r: n.r});
            }
          }
        });
      });
      positions = newPositions;
    }
  }

  if (piece.t === 'spider') {
    let positions = new Set([`${piece.q},${piece.r}`]);
    let current = [[piece.q, piece.r]];
    
    for (let step = 0; step < 3; step++) {
      const next = [];
      current.forEach(([q, r]) => {
        getAdjacentCoords(q, r).forEach(n => {
          const key = `${n.q},${n.r}`;
          if (!findPieceAt(board, n.q, n.r) && !positions.has(key) && 
              canSlide(board, {q, r}, n)) {
            const newBoard = [...board.filter(x => x !== piece),
              {...piece, q: n.q, r: n.r}];
            if (isConnected(newBoard)) {
              positions.add(key);
              next.push([n.q, n.r]);
              if (step === 2) moves.add(`${n.q},${n.r},0`);
            }
          }
        });
      });
      current = next;
    }
  }

  if (piece.t === 'grasshopper') {
    DIRECTIONS.forEach(([dq, dr]) => {
      let q = piece.q + dq;
      let r = piece.r + dr;
      let jumped = false;
      
      while (findPieceAt(board, q, r)) {
        jumped = true;
        q += dq;
        r += dr;
      }
      
      if (jumped && !findPieceOnTop(board, q, r)) {
        // Create a new board state with the piece moved to test connectivity
        const newBoard = [...board.filter(p => p !== piece), 
          {...piece, q, r, z: 0}];
        
        if (isConnected(newBoard)) {
          moves.add(`${q},${r},0`);
        }
      }
    });
  }

  return Array.from(moves).map(m => {
    const [q, r, z] = m.split(',').map(Number);
    return {q, r, z};
  });
};

export const hasLost = (board, player) => {
  if (!Array.isArray(board)) return false;
  
  return board.some(x => 
    x.t === 'queen' && 
    x.p === player &&
    getAdjacentCoords(x.q, x.r)
      .every(n => findPieceOnTop(board, n.q, n.r))
  );
};

export const isDraw = (board) => {
  return hasLost(board, 1) && hasLost(board, 2);
};

export const getGameState = (board, turn) => {
  if (hasLost(board, 1)) return "PLAYER_2_WINS";
  if (hasLost(board, 2)) return "PLAYER_1_WINS";
  if (isDraw(board)) return "DRAW";
  return "PLAYING";
};

export const highlightLegalMoves = (board, piece, turn, setHighlightedTiles) => {
    if (!piece) {
      setHighlightedTiles([]);
      return;
    }
  
    const validMoves = getValidMoves(board, piece, turn);
    const highlightedTiles = validMoves.map(({ q, r }) => `${q},${r}`);
    setHighlightedTiles(highlightedTiles);
  };
  