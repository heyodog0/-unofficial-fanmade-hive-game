// // components/GameLogic.js

// components/GameLogic.js

export const DIRECTIONS = [
    [1, 0],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [0, -1],
    [1, -1],
  ];
  
  export const PIECES = {
    queen: 1,
    beetle: 2,
    spider: 2,
    grasshopper: 3,
    ant: 3,
  };
  
  export const calculatePosition = (q, r, hexSize) => ({
    // Adjust x and y offsets to move the center 7 hexagons to the middle
    x: hexSize * (1.73 * q + 0.87 * r) + 400, // Changed from 300 to 400
    y: hexSize * 1.5 * r + 397, // Changed from 300 to 400
  });
  
  export const findPieceAt = (board, q, r, includeAbove = false) =>
    board
      .filter((x) => x.q === q && x.r === r)
      .sort((a, b) => a.z - b.z)[0];
  
  export const findPieceOnTop = (board, q, r) =>
    board
      .filter((x) => x.q === q && x.r === r)
      .sort((a, b) => b.z - a.z)[0];
  
  export const getAdjacentCoords = (q, r) =>
    DIRECTIONS.map(([dq, dr]) => ({ q: q + dq, r: r + dr }));
  
  export const countPieces = (board, type, player) =>
    board.filter((x) => x.t === type && x.p === player).length;
  
  export const isConnected = (board) => {
    if (board.length <= 1) return true;
  
    const groundPieces = board.filter((x) => x.z === 0);
    const seen = new Set();
    const toCheck = [groundPieces[0]];
  
    while (toCheck.length) {
      const piece = toCheck.pop();
      const key = `${piece.q},${piece.r}`;
  
      if (!seen.has(key)) {
        seen.add(key);
        getAdjacentCoords(piece.q, piece.r).forEach((n) => {
          const neighbor = findPieceAt(board, n.q, n.r);
          if (neighbor && neighbor.z === 0) toCheck.push(neighbor);
        });
      }
    }
  
    return seen.size === groundPieces.length;
  };
  
  export const canMove = (board, currentPlayer) => {
    // Can't move until queen is placed
    const hasQueen = board.some(
      (piece) => piece.p === currentPlayer && piece.t === 'queen'
    );
  
    return hasQueen;
  };
  
  export const canPlace = (board, q, r, type, player, turn) => {
    // For the first placement
    if (!board.length) {
      const distance = Math.abs(q) + Math.abs(r) + Math.abs(-q - r);
      return distance <= 2;
    }
  
    // Get all pieces that aren't covered by beetles
    const uncoveredPieces = board.filter((piece) => {
      const pieceOnTop = findPieceOnTop(board, piece.q, piece.r);
      return pieceOnTop.z === piece.z; // Only include if it's the top piece
    });
  
    const neighbors = getAdjacentCoords(q, r)
      .map((n) => findPieceOnTop(board, n.q, n.r))
      .filter((x) => x);
  
    return (
      neighbors.length > 0 &&
      (uncoveredPieces.length < 2 ||
        neighbors.some((x) => x.p === player)) &&
      neighbors.every(
        (x) => uncoveredPieces.length < 2 || x.p === player
      ) &&
      countPieces(board, type, player) < PIECES[type] &&
      (turn <= 6 ||
        countPieces(board, 'queen', player) > 0 ||
        type === 'queen')
    );
  };
  
  export const canSlide = (board, from, to) => {
    // Cannot slide if the piece is not on ground level
    if (findPieceOnTop(board, from.q, from.r).z > 0) return false;
  
    // The movement must be to an adjacent hex
    const isAdjacent = getAdjacentCoords(from.q, from.r).some(
      (coord) => coord.q === to.q && coord.r === to.r
    );
    if (!isAdjacent) return false;
  
    // Destination must be empty (except for beetles)
    if (findPieceAt(board, to.q, to.r)) return false;
  
    // Check if the piece is 'pinned' (cannot move out if completely surrounded)
    const fromOccupiedSides = getAdjacentCoords(from.q, from.r).filter(
      (coord) => findPieceAt(board, coord.q, coord.r)
    ).length;
    if (fromOccupiedSides === 6) return false; // Can't move out if completely surrounded
  
    // Implementing the 'Freedom to Move' rule:
    // For the sliding move between 'from' and 'to', the two hexes adjacent to both must not both be occupied
    const sharedNeighbors = getAdjacentCoords(from.q, from.r).filter(
      (coord) =>
        getAdjacentCoords(to.q, to.r).some(
          (n) => n.q === coord.q && n.r === coord.r
        )
    );
  
    // If both shared neighbors are occupied, cannot slide between 'from' and 'to'
    const blocked = sharedNeighbors.every((coord) =>
      findPieceAt(board, coord.q, coord.r)
    );
    if (blocked) return false;
  
    // Passed all checks, can slide
    return true;
  };
  
  export const getValidMoves = (board, piece, turn) => {
    if (!piece) return [];
  
    const hasQueen = board.some(
      (p) => p.p === piece.p && p.t === 'queen'
    );
  
    if (!hasQueen) return [];
  
    const moves = new Set();
  
    // Helper to verify both sliding and connectivity
    const isValidMove = (q, r, z = 0) => {
      // Must be able to slide there
      if (!canSlide(board, piece, { q, r })) return false;
  
      // Must maintain connectivity
      const tempBoard = [
        ...board.filter((p) => p !== piece),
        { ...piece, q, r, z },
      ];
      return isConnected(tempBoard);
    };
  
    // Helper to verify only hive connectivity (for ant, spider, grasshopper)
    const isValidHiveMove = (q, r, z = 0) => {
      // Must maintain connectivity
      const tempBoard = [
        ...board.filter((p) => p !== piece),
        { ...piece, q, r, z },
      ];
      return isConnected(tempBoard);
    };
  
    if (piece.t === 'queen' || piece.t === 'beetle') {
      getAdjacentCoords(piece.q, piece.r).forEach((pos) => {
        // For queen, skip occupied spaces
        if (piece.t === 'queen' && findPieceAt(board, pos.q, pos.r))
          return;
  
        // For beetle, calculate new height
        const targetPiece = findPieceOnTop(board, pos.q, pos.r);
        const newZ =
          piece.t === 'beetle'
            ? targetPiece
              ? targetPiece.z + 1
              : 0
            : 0;
  
        // Check both sliding and connectivity
        if (isValidMove(pos.q, pos.r, newZ)) {
          moves.add(`${pos.q},${pos.r},${newZ}`);
        }
      });
    }
  
    if (piece.t === 'spider') {
      let positions = new Set([`${piece.q},${piece.r}`]);
      let current = [[piece.q, piece.r]];
  
      for (let step = 0; step < 3; step++) {
        const next = [];
        current.forEach(([q, r]) => {
          getAdjacentCoords(q, r).forEach((n) => {
            const key = `${n.q},${n.r}`;
            if (
              !findPieceAt(board, n.q, n.r) &&
              !positions.has(key) &&
              canSlide(board, { q, r }, n)
            ) {
              positions.add(key);
              next.push([n.q, n.r]);
  
              // After 3 steps, check hive connectivity
              if (step === 2 && isValidHiveMove(n.q, n.r)) {
                moves.add(`${n.q},${n.r},0`);
              }
            }
          });
        });
        current = next;
      }
    }
  
    if (piece.t === 'ant') {
      const seen = new Set([`${piece.q},${piece.r}`]);
      let positions = [{ q: piece.q, r: piece.r }];
  
      while (positions.length) {
        const newPositions = [];
        positions.forEach((pos) => {
          getAdjacentCoords(pos.q, pos.r).forEach((n) => {
            const key = `${n.q},${n.r}`;
            if (
              !findPieceAt(board, n.q, n.r) &&
              !seen.has(key) &&
              canSlide(board, pos, n)
            ) {
              seen.add(key);
              newPositions.push({ q: n.q, r: n.r });
  
              // Check hive connectivity for this potential move
              if (isValidHiveMove(n.q, n.r)) {
                moves.add(`${n.q},${n.r},0`);
              }
            }
          });
        });
        positions = newPositions;
      }
    }
  
    if (piece.t === 'grasshopper') {
      DIRECTIONS.forEach(([dq, dr]) => {
        let q = piece.q + dq,
          r = piece.r + dr;
        let jumped = false;
  
        while (findPieceAt(board, q, r)) {
          jumped = true;
          q += dq;
          r += dr;
        }
  
        if (jumped && !findPieceOnTop(board, q, r)) {
          // Check hive connectivity for grasshopper landing spot
          if (isValidHiveMove(q, r)) {
            moves.add(`${q},${r},0`);
          }
        }
      });
    }
  
    return Array.from(moves).map((m) => {
      const [q, r, z] = m.split(',').map(Number);
      return { q, r, z };
    });
  };
  
  export const hasLost = (board, player) => {
    if (!Array.isArray(board)) return false;
  
    return board.some(
      (x) =>
        x.t === 'queen' &&
        x.p === player &&
        getAdjacentCoords(x.q, x.r).every((n) =>
          findPieceOnTop(board, n.q, n.r)
        )
    );
  };
  
  export const isDraw = (board) => {
    return hasLost(board, 1) && hasLost(board, 2);
  };
  
  export const getGameState = (board, turn) => {
    if (hasLost(board, 1)) return 'PLAYER_2_WINS';
    if (hasLost(board, 2)) return 'PLAYER_1_WINS';
    if (isDraw(board)) return 'DRAW';
    return 'PLAYING';
  };
  
  export const isMoveValid = (board, from, to) => {
    if (!from) return false;
  
    // Get all valid moves for the piece
    const validMoves = getValidMoves(board, from);
  
    // Check if the target position exists in valid moves
    // Include z-height check for beetles
    return validMoves.some(
      (move) =>
        move.q === to.q &&
        move.r === to.r &&
        (from.t !== 'beetle' || move.z === to.z)
    );
  };
  

// export const DIRECTIONS = [[1,0], [0,1], [-1,1], [-1,0], [0,-1], [1,-1]];
// export const PIECES = {queen: 1, beetle: 2, spider: 2, grasshopper: 3, ant: 3};

// export const calculatePosition = (q, r, hexSize) => ({
//     // Adjust x and y offsets to move the center 7 hexagons to the middle
//     x: hexSize * (1.73 * q + 0.87 * r) + 400, // Changed from 300 to 400
//     y: hexSize * 1.5 * r + 397  // Changed from 300 to 400
//   });

// export const findPieceAt = (board, q, r, includeAbove = false) => 
//   board.filter(x => x.q === q && x.r === r)
//     .sort((a, b) => a.z - b.z)[0];

// export const findPieceOnTop = (board, q, r) => 
//   board.filter(x => x.q === q && x.r === r)
//     .sort((a, b) => b.z - a.z)[0];

// export const getAdjacentCoords = (q, r) => 
//   DIRECTIONS.map(([dq, dr]) => ({q: q + dq, r: r + dr}));

// export const countPieces = (board, type, player) => 
//   board.filter(x => x.t === type && x.p === player).length;

// export const isConnected = (board) => {
//   if (board.length <= 1) return true;
  
//   const groundPieces = board.filter(x => x.z === 0);
//   const seen = new Set();
//   const toCheck = [groundPieces[0]];
  
//   while (toCheck.length) {
//     const piece = toCheck.pop();
//     const key = `${piece.q},${piece.r}`;
    
//     if (!seen.has(key)) {
//       seen.add(key);
//       getAdjacentCoords(piece.q, piece.r).forEach(n => {
//         const neighbor = findPieceAt(board, n.q, n.r);
//         if (neighbor && neighbor.z === 0) toCheck.push(neighbor);
//       });
//     }
//   }
  
//   return seen.size === groundPieces.length;
// };

// export const canMove = (board, currentPlayer) => {
//     // Can't move until queen is placed
//     const hasQueen = board.some(piece => 
//       piece.p === currentPlayer && piece.t === 'queen'
//     );
    
//     return hasQueen;
// };

// export const canPlace = (board, q, r, type, player, turn) => {
//     // For the first placement
//     if (!board.length) {
//       const distance = Math.abs(q) + Math.abs(r) + Math.abs(-q-r);
//       return distance <= 2;
//     }
    
//     // Get all pieces that aren't covered by beetles
//     const uncoveredPieces = board.filter(piece => {
//       const pieceOnTop = findPieceOnTop(board, piece.q, piece.r);
//       return pieceOnTop.z === piece.z; // Only include if it's the top piece
//     });
    
//     const neighbors = getAdjacentCoords(q, r)
//       .map(n => findPieceOnTop(board, n.q, n.r))
//       .filter(x => x);
    
//     return neighbors.length > 0 && 
//            (uncoveredPieces.length < 2 || neighbors.some(x => x.p === player)) &&
//            neighbors.every(x => uncoveredPieces.length < 2 || x.p === player) &&
//            countPieces(board, type, player) < PIECES[type] &&
//            (turn <= 6 || countPieces(board, 'queen', player) > 0 || type === 'queen');
// };

// export const getValidMoves = (board, piece, turn) => {
//     if (!piece) return [];

//     const hasQueen = board.some(p => 
//         p.p === piece.p && 
//         p.t === 'queen'
//     );
    
//     if (!hasQueen) return [];

//     const moves = new Set();

//     // Helper to verify both sliding and connectivity
//     const isValidMove = (q, r, z = 0) => {
//         // Must be able to slide there
//         if (!canSlide(board, piece, {q, r})) return false;

//         // Must maintain connectivity
//         const tempBoard = [
//             ...board.filter(p => p !== piece),
//             {...piece, q, r, z}
//         ];
//         return isConnected(tempBoard);
//     };

//     // Helper to verify only hive connectivity (for ant, spider, grasshopper)
//     const isValidHiveMove = (q, r, z = 0) => {
//         // Must maintain connectivity
//         const tempBoard = [
//             ...board.filter(p => p !== piece),
//             {...piece, q, r, z}
//         ];
//         return isConnected(tempBoard);
//     };

//     if (piece.t === 'queen' || piece.t === 'beetle') {
//         getAdjacentCoords(piece.q, piece.r).forEach(pos => {
//             // For queen, skip occupied spaces
//             if (piece.t === 'queen' && findPieceAt(board, pos.q, pos.r)) return;
            
//             // For beetle, calculate new height
//             const targetPiece = findPieceOnTop(board, pos.q, pos.r);
//             const newZ = piece.t === 'beetle' ? 
//                 (targetPiece ? targetPiece.z + 1 : 0) : 0;
            
//             // Check both sliding and connectivity
//             if (isValidMove(pos.q, pos.r, newZ)) {
//                 moves.add(`${pos.q},${pos.r},${newZ}`);
//             }
//         });
//     }

//     if (piece.t === 'spider') {
//         let positions = new Set([`${piece.q},${piece.r}`]);
//         let current = [[piece.q, piece.r]];
        
//         for (let step = 0; step < 3; step++) {
//             const next = [];
//             current.forEach(([q, r]) => {
//                 getAdjacentCoords(q, r).forEach(n => {
//                     const key = `${n.q},${n.r}`;
//                     if (!findPieceAt(board, n.q, n.r) && !positions.has(key) && 
//                         canSlide(board, {q, r}, n)) {
//                         positions.add(key);
//                         next.push([n.q, n.r]);

//                         // After 3 steps, check hive connectivity
//                         if (step === 2 && isValidHiveMove(n.q, n.r)) {
//                             moves.add(`${n.q},${n.r},0`);
//                         }
//                     }
//                 });
//             });
//             current = next;
//         }
//     }

//     if (piece.t === 'ant') {
//         const seen = new Set([`${piece.q},${piece.r}`]);
//         let positions = [piece];
        
//         while (positions.length) {
//             const newPositions = [];
//             positions.forEach(pos => {
//                 getAdjacentCoords(pos.q, pos.r).forEach(n => {
//                     const key = `${n.q},${n.r}`;
//                     if (!findPieceAt(board, n.q, n.r) && !seen.has(key) && 
//                         canSlide(board, pos, n)) {
//                         seen.add(key);
//                         newPositions.push({q: n.q, r: n.r});

//                         // Check hive connectivity for this potential move
//                         if (isValidHiveMove(n.q, n.r)) {
//                             moves.add(`${n.q},${n.r},0`);
//                         }
//                     }
//                 });
//             });
//             positions = newPositions;
//         }
//     }

//     if (piece.t === 'grasshopper') {
//         DIRECTIONS.forEach(([dq, dr]) => {
//             let q = piece.q + dq, r = piece.r + dr;
//             let jumped = false;
            
//             while (findPieceAt(board, q, r)) {
//                 jumped = true;
//                 q += dq;
//                 r += dr;
//             }
            
//             if (jumped && !findPieceOnTop(board, q, r)) {
//                 // Check hive connectivity for grasshopper landing spot
//                 if (isValidHiveMove(q, r)) {
//                     moves.add(`${q},${r},0`);
//                 }
//             }
//         });
//     }

//     return Array.from(moves).map(m => {
//         const [q, r, z] = m.split(',').map(Number);
//         return {q, r, z};
//     });
// };

// export const canSlide = (board, from, to) => {
//     // Cannot slide if the piece is not on ground level
//     if (findPieceOnTop(board, from.q, from.r).z > 0) return false;

//     // The movement must be to an adjacent hex
//     const isAdjacent = getAdjacentCoords(from.q, from.r)
//         .some(coord => coord.q === to.q && coord.r === to.r);
//     if (!isAdjacent) return false;

//     // Destination must be empty (except for beetles)
//     if (findPieceAt(board, to.q, to.r)) return false;

//     // Check if the piece is 'pinned' (cannot move out if completely surrounded)
//     const fromOccupiedSides = getAdjacentCoords(from.q, from.r)
//         .filter(coord => findPieceAt(board, coord.q, coord.r))
//         .length;
//     if (fromOccupiedSides === 6) return false; // Can't move out if completely surrounded

//     // Implementing the 'Freedom to Move' rule:
//     // For the sliding move between 'from' and 'to', the two hexes adjacent to both must not both be occupied
//     const sharedNeighbors = getAdjacentCoords(from.q, from.r)
//         .filter(coord => getAdjacentCoords(to.q, to.r)
//             .some(n => n.q === coord.q && n.r === coord.r));

//     // If both shared neighbors are occupied, cannot slide between 'from' and 'to'
//     const blocked = sharedNeighbors.every(coord => findPieceAt(board, coord.q, coord.r));
//     if (blocked) return false;

//     // Passed all checks, can slide
//     return true;

// export const hasLost = (board, player) => {
//   if (!Array.isArray(board)) return false;
  
//   return board.some(x => 
//     x.t === 'queen' && 
//     x.p === player &&
//     getAdjacentCoords(x.q, x.r)
//       .every(n => findPieceOnTop(board, n.q, n.r))
//   );
// };

// export const isDraw = (board) => {
//   return hasLost(board, 1) && hasLost(board, 2);
// };

// export const getGameState = (board, turn) => {
//   if (hasLost(board, 1)) return "PLAYER_2_WINS";
//   if (hasLost(board, 2)) return "PLAYER_1_WINS";
//   if (isDraw(board)) return "DRAW";
//   return "PLAYING";
// };

// export const isMoveValid = (board, from, to) => {
//     if (!from) return false;
    
//     // Get all valid moves for the piece
//     const validMoves = getValidMoves(board, from);
    
//     // Check if the target position exists in valid moves
//     // Include z-height check for beetles
//     return validMoves.some(move => 
//         move.q === to.q && 
//         move.r === to.r &&
//         (from.t !== 'beetle' || move.z === to.z)
//     );
// };