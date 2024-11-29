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
    // Beetles can move to any adjacent hex, regardless of what's there
    if (from.t === 'beetle') {
      const isAdjacent = getAdjacentCoords(from.q, from.r)
        .some(p => p.q === to.q && p.r === to.r);
      return isAdjacent;
    }
  
    const commonNeighbors = getAdjacentCoords(from.q, from.r)
      .filter(p => getAdjacentCoords(to.q, to.r)
        .some(n => n.q === p.q && n.r === p.r))
      .filter(p => findPieceAt(board, p.q, p.r));
  
    return commonNeighbors.length > 0;
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

export const canMove = (board, currentPlayer, turn) => {
    // Can't move until queen is placed
    const hasQueen = board.some(piece => 
      piece.p === currentPlayer && piece.t === 'queen'
    );
    
    return hasQueen;
  };

export const canPlace = (board, q, r, type, player, turn) => {
    // For the first placement
    if (!board.length) {
      // Center 7 hexagons - center hex plus its 6 neighbors
      // Using axial coordinates, distance from center is |q| + |r| + |-q-r|
      const distance = Math.abs(q) + Math.abs(r) + Math.abs(-q-r);
      return distance <= 2; // Distance of 2 or less gives us the center 7 hexagons
    }
    
    const neighbors = getAdjacentCoords(q, r)
      .map(n => findPieceAt(board, n.q, n.r))
      .filter(x => x);
    
    return neighbors.length > 0 && 
           (board.length < 2 || neighbors.some(x => x.p === player)) &&
           neighbors.every(x => board.length < 2 || x.p === player) &&
           countPieces(board, type, player) < PIECES[type] &&
           (turn <= 6 || countPieces(board, 'queen', player) > 0 || type === 'queen');
  };

export const getValidMoves = (board, piece, turn) => {
    // First check: can't move any pieces until queen is placed
    const hasQueen = board.some(p => p.p === piece.p && p.t === 'queen');
    if (!piece || !hasQueen) return [];

    const moves = new Set();
  
    if (piece.t === 'queen' || piece.t === 'beetle') {
      getAdjacentCoords(piece.q, piece.r).forEach(pos => {
        if (piece.t === 'queen' && findPieceOnTop(board, pos.q, pos.r)) return;
        
        const targetPiece = findPieceOnTop(board, pos.q, pos.r);
        const newZ = piece.t === 'beetle' ? (targetPiece ? targetPiece.z + 1 : 0) : 0;
        
        // For beetle, check if move is adjacent. For queen, check if can slide
        if ((piece.t === 'beetle') || (!findPieceOnTop(board, pos.q, pos.r) && canSlide(board, piece, pos))) {
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
      let q = piece.q + dq, r = piece.r + dr;
      let jumped = false;
      
      while (findPieceAt(board, q, r)) {
        jumped = true;
        q += dq;
        r += dr;
      }
      
      if (jumped && !findPieceOnTop(board, q, r)) {
        moves.add(`${q},${r},0`);
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