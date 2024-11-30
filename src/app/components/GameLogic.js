// // GameLogic.js

// export const DIRECTIONS = [
//     [1, 0],
//     [0, 1],
//     [-1, 1],
//     [-1, 0],
//     [0, -1],
//     [1, -1],
//   ];
  
//   export const PIECES = {
//     queen: 1,
//     beetle: 2,
//     spider: 2,
//     grasshopper: 3,
//     ant: 3,
//   };
  
//   export const calculatePosition = (q, r, hexSize) => ({
//     x: hexSize * (1.73 * q + 0.87 * r) + 400,
//     y: hexSize * 1.5 * r + 397,
//   });
  
//   export const findPieceAt = (board, q, r, z = null) =>
//     board.filter((p) => p.q === q && p.r === r && (z === null || p.z === z));
  
//   export const findPieceOnTop = (board, q, r) => {
//     const pieces = findPieceAt(board, q, r);
//     if (pieces.length === 0) return null;
//     return pieces.reduce((topPiece, p) => (p.z > topPiece.z ? p : topPiece), pieces[0]);
//   };
  
//   export const getAdjacentCoords = (q, r) =>
//     DIRECTIONS.map(([dq, dr]) => ({ q: q + dq, r: r + dr }));
  
//   export const countPieces = (board, type, player) =>
//     board.filter((p) => p.t === type && p.p === player).length;
  
//   export const isSamePiece = (p1, p2) =>
//     p1.q === p2.q &&
//     p1.r === p2.r &&
//     p1.z === p2.z &&
//     p1.p === p2.p &&
//     p1.t === p2.t;
  
//   export const isConnected = (board) => {
//     if (board.length <= 1) return true;
  
//     const visited = new Set();
//     const toVisit = [board[0]];
  
//     while (toVisit.length > 0) {
//       const piece = toVisit.pop();
//       const key = `${piece.q},${piece.r},${piece.z}`;
//       if (visited.has(key)) continue;
//       visited.add(key);
  
//       // Get adjacent pieces
//       getAdjacentCoords(piece.q, piece.r).forEach(({ q, r }) => {
//         const neighborPieces = findPieceAt(board, q, r);
//         neighborPieces.forEach((neighbor) => {
//           const neighborKey = `${neighbor.q},${neighbor.r},${neighbor.z}`;
//           if (!visited.has(neighborKey)) {
//             toVisit.push(neighbor);
//           }
//         });
//       });
  
//       // Also consider pieces stacked at the same position
//       const samePositionPieces = board.filter(
//         (p) => p.q === piece.q && p.r === piece.r && p.z !== piece.z
//       );
//       samePositionPieces.forEach((p) => {
//         const pKey = `${p.q},${p.r},${p.z}`;
//         if (!visited.has(pKey)) {
//           toVisit.push(p);
//         }
//       });
//     }
  
//     return visited.size === board.length;
//   };
  
//   export const canSlide = (board, from, to, piece) => {
//     const isAdjacent = getAdjacentCoords(from.q, from.r).some(
//       (coord) => coord.q === to.q && coord.r === to.r
//     );
//     if (!isAdjacent) return false;
  
//     if (piece.t === 'beetle') {
//       // Beetles can move onto occupied spaces and can move even when completely surrounded
//       return true;
//     }
  
//     // Cannot slide if there are pieces on top of the moving piece
//     const pieceOnTop = findPieceOnTop(board, from.q, from.r);
//     if (!pieceOnTop || !isSamePiece(pieceOnTop, piece)) return false;
  
//     // Cannot slide if the moving piece is not on ground level
//     if (piece.z > 0) return false;
  
//     // Destination must be empty
//     if (findPieceAt(board, to.q, to.r).length > 0) return false;
  
//     // Simulate the moving piece being absent from the 'from' position
//     const boardWithoutMovingPiece = board.filter((p) => !isSamePiece(p, piece));
  
//     // Implementing the 'Freedom to Move' rule:
//     // Get the two cells adjacent to both 'from' and 'to'
//     const sharedNeighbors = getAdjacentCoords(from.q, from.r).filter((coord) =>
//       getAdjacentCoords(to.q, to.r).some((n) => n.q === coord.q && n.r === coord.r)
//     );
  
//     // At least one of the shared neighbors must be empty
//     const canSlideBetween = sharedNeighbors.some(
//       (coord) => findPieceAt(boardWithoutMovingPiece, coord.q, coord.r).length === 0
//     );
//     if (!canSlideBetween) return false;
  
//     // No need to check if the piece is 'pinned' here as we're simulating movement
  
//     return true;
//   };
  
  
  
  
  
// //   export const canSlide = (board, from, to, piece) => {
// //     const isAdjacent = getAdjacentCoords(from.q, from.r).some(
// //       (coord) => coord.q === to.q && coord.r === to.r
// //     );
// //     if (!isAdjacent) return false;
  
// //     if (piece.t === 'beetle') {
// //       // Beetles can move onto occupied spaces and can move even when completely surrounded
// //       return true;
// //     }
  
// //     // Cannot slide if there's no piece at the from position
// //     const pieceOnTop = findPieceOnTop(board, from.q, from.r);
// //     if (!pieceOnTop) return false;
  
// //     // Cannot slide if the piece is not on ground level
// //     if (pieceOnTop.z > 0) return false;
  
// //     // Destination must be empty
// //     if (findPieceAt(board, to.q, to.r).length > 0) return false;
  
// //     // Check if the piece is 'pinned' (cannot move out if completely surrounded)
// //     const fromOccupiedSides = getAdjacentCoords(from.q, from.r).filter(
// //       (coord) => findPieceAt(board, coord.q, coord.r).length > 0
// //     ).length;
// //     if (fromOccupiedSides === 6) return false;
  
// //     // Implementing the 'Freedom to Move' rule:
// //     const sharedNeighbors = getAdjacentCoords(from.q, from.r).filter(
// //       (coord) =>
// //         getAdjacentCoords(to.q, to.r).some(
// //           (n) => n.q === coord.q && n.r === coord.r
// //         )
// //     );
  
// //     const blocked = sharedNeighbors.every((coord) =>
// //       findPieceAt(board, coord.q, coord.r).length > 0
// //     );
// //     if (blocked) return false;
  
// //     return true;
// //   };
  
//   export const getValidMoves = (board, piece, turn) => {
//     if (!piece) return [];
  
//     const hasQueen = board.some(
//       (p) => p.p === piece.p && p.t === 'queen'
//     );
  
//     if (!hasQueen) return [];
  
//     const moves = new Set();
  
//     // Helper to verify both sliding and connectivity
//     const isValidMove = (tempBoard, from, to, z = 0) => {
//       // Must be able to slide there
//       if (!canSlide(tempBoard, from, to, piece)) return false;
  
//       // Remove the piece from tempBoard by matching properties
//       const newBoard = tempBoard.filter((p) => !isSamePiece(p, piece));
  
//       // Add the piece at the new position
//       newBoard.push({ ...piece, q: to.q, r: to.r, z });
  
//       // Must maintain connectivity
//       return isConnected(newBoard);
//     };
  
//     const tempBoard = board;
  
//     if (piece.t === 'queen' || piece.t === 'beetle') {
//       const from = { q: piece.q, r: piece.r };
  
//       getAdjacentCoords(piece.q, piece.r).forEach((pos) => {
//         // For queen, skip occupied spaces
//         if (piece.t === 'queen' && findPieceAt(board, pos.q, pos.r).length > 0)
//           return;
  
//         // For beetle, calculate new height
//         const targetPiece = findPieceOnTop(board, pos.q, pos.r);
//         const newZ =
//           piece.t === 'beetle'
//             ? targetPiece
//               ? targetPiece.z + 1
//               : 0
//             : 0;
  
//         // For beetle, we need to consider moving onto occupied spaces
//         if (
//           isValidMove(tempBoard, from, pos, newZ)
//         ) {
//           moves.add(`${pos.q},${pos.r},${newZ}`);
//         }
//       });
//     }
  
  
// // Spider movement - exactly 3 steps
// if (piece.t === 'spider') {
//     const dfsSpider = (currentPos, path, depth) => {
//         if (depth === 3) {
//             // Spider must move exactly 3 steps
//             const tempBoard = board.filter((p) => !isSamePiece(p, piece));
//             tempBoard.push({ ...piece, q: currentPos.q, r: currentPos.r });
//             if (isConnected(tempBoard)) {
//                 moves.add(`${currentPos.q},${currentPos.r},0`);
//             }
//             return;
//         }

//         getAdjacentCoords(currentPos.q, currentPos.r).forEach((next) => {
//             const nextKey = `${next.q},${next.r}`;
//             if (!path.has(nextKey)) {
//                 // Check if the Spider can slide to this position
//                 const tempBoard = board.filter((p) => !isSamePiece(p, piece));
//                 if (canSlide(tempBoard, currentPos, next, piece)) {
//                     path.add(nextKey); // Mark this position as visited
//                     dfsSpider(next, path, depth + 1); // Recursive DFS
//                     path.delete(nextKey); // Backtrack
//                 }
//             }
//         });
//     };

//     const spiderPath = new Set([`${piece.q},${piece.r}`]);
//     dfsSpider({ q: piece.q, r: piece.r }, spiderPath, 0);
// }
  
  
  
// // Ant movement - free to move
// if (piece.t === 'ant') {
//     const seen = new Set([`${piece.q},${piece.r}`]);
//     let positions = [piece];
    
//     while (positions.length) {
//       const newPositions = [];
//       positions.forEach(pos => {
//         getAdjacentCoords(pos.q, pos.r).forEach(n => {
//           const key = `${n.q},${n.r}`;
//           if (!findPieceAt(board, n.q, n.r) && !seen.has(key) && 
//               canSlide(board, pos, n)) {
//             const newBoard = [...board.filter(x => x !== piece),
//               {...piece, q: n.q, r: n.r}];
//             if (isConnected(newBoard)) {
//               seen.add(key);
//               moves.add(`${n.q},${n.r},0`);
//               newPositions.push({q: n.q, r: n.r});
//             }
//           }
//         });
//       });
//       positions = newPositions;
//     }
//   }
  
  
  
  
  
  
//     // Grasshopper movement
//     if (piece.t === 'grasshopper') {
//       DIRECTIONS.forEach(([dq, dr]) => {
//         let q = piece.q + dq;
//         let r = piece.r + dr;
//         let jumped = false;
  
//         while (findPieceAt(board, q, r).length > 0) {
//           jumped = true;
//           q += dq;
//           r += dr;
//         }
  
//         if (jumped) {
//           if (!findPieceOnTop(board, q, r)) {
//             // Simulate moving the piece to the landing spot
//             const tempBoard = board.filter((p) => !isSamePiece(p, piece));
//             tempBoard.push({ ...piece, q, r, z: 0 });
//             if (isConnected(tempBoard)) {
//               moves.add(`${q},${r},0`);
//             }
//           }
//         }
//       });
//     }
  
//     return Array.from(moves).map((m) => {
//       const [q, r, z] = m.split(',').map(Number);
//       return { q, r, z };
//     });
//   };
  
//   export const hasLost = (board, player) => {
//     if (!Array.isArray(board)) return false;
  
//     return board.some(
//       (x) =>
//         x.t === 'queen' &&
//         x.p === player &&
//         getAdjacentCoords(x.q, x.r).every((n) =>
//           findPieceOnTop(board, n.q, n.r)
//         )
//     );
//   };
  
//   export const isDraw = (board) => {
//     return hasLost(board, 1) && hasLost(board, 2);
//   };
  
//   export const getGameState = (board, turn) => {
//     if (hasLost(board, 1)) return 'PLAYER_2_WINS';
//     if (hasLost(board, 2)) return 'PLAYER_1_WINS';
//     if (isDraw(board)) return 'DRAW';
//     return 'PLAYING';
//   };
  
//   export const isMoveValid = (board, from, to) => {
//     if (!from) return false;
  
//     const validMoves = getValidMoves(board, from);
  
//     return validMoves.some(
//       (move) =>
//         move.q === to.q &&
//         move.r === to.r &&
//         (from.t !== 'beetle' || move.z === to.z)
//     );
//   };
  
//   export const canPlace = (board, q, r, type, player, turn) => {
//     // For the first placement
//     if (!board.length) {
//       const distance = Math.abs(q) + Math.abs(r) + Math.abs(-q - r);
//       return distance <= 2;
//     }
  
//     // Get all pieces that aren't covered by beetles
//     const uncoveredPieces = board.filter((piece) => {
//       const pieceOnTop = findPieceOnTop(board, piece.q, piece.r);
//       return pieceOnTop.z === piece.z; // Only include if it's the top piece
//     });
  
//     const neighbors = getAdjacentCoords(q, r)
//       .map((n) => findPieceOnTop(board, n.q, n.r))
//       .filter((x) => x);
  
//     return (
//       neighbors.length > 0 &&
//       (uncoveredPieces.length < 2 || neighbors.some((x) => x.p === player)) &&
//       neighbors.every((x) => uncoveredPieces.length < 2 || x.p === player) &&
//       countPieces(board, type, player) < PIECES[type] &&
//       (turn <= 6 || countPieces(board, 'queen', player) > 0 || type === 'queen')
//     );
//   };
  

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

export const highlightLegalMoves = (board, piece, turn, setHighlightedTiles) => {
    if (!piece) {
      setHighlightedTiles([]);
      return;
    }
  
    const validMoves = getValidMoves(board, piece, turn);
    const highlightedTiles = validMoves.map(({ q, r }) => `${q},${r}`);
    setHighlightedTiles(highlightedTiles);
  };
  