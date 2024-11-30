// GameLogic.js

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
    x: hexSize * (1.73 * q + 0.87 * r) + 400,
    y: hexSize * 1.5 * r + 397,
  });
  
  export const findPieceAt = (board, q, r, z = null) =>
    board.filter((p) => p.q === q && p.r === r && (z === null || p.z === z));
  
  export const findPieceOnTop = (board, q, r) => {
    const pieces = findPieceAt(board, q, r);
    if (pieces.length === 0) return null;
    return pieces.reduce((topPiece, p) => (p.z > topPiece.z ? p : topPiece), pieces[0]);
  };
  
  export const getAdjacentCoords = (q, r) =>
    DIRECTIONS.map(([dq, dr]) => ({ q: q + dq, r: r + dr }));
  
  export const countPieces = (board, type, player) =>
    board.filter((p) => p.t === type && p.p === player).length;
  
  export const isSamePiece = (p1, p2) =>
    p1.q === p2.q &&
    p1.r === p2.r &&
    p1.z === p2.z &&
    p1.p === p2.p &&
    p1.t === p2.t;
  
  export const isConnected = (board) => {
    if (board.length <= 1) return true;
  
    const visited = new Set();
    const toVisit = [board[0]];
  
    while (toVisit.length > 0) {
      const piece = toVisit.pop();
      const key = `${piece.q},${piece.r},${piece.z}`;
      if (visited.has(key)) continue;
      visited.add(key);
  
      // Get adjacent pieces
      getAdjacentCoords(piece.q, piece.r).forEach(({ q, r }) => {
        const neighborPieces = findPieceAt(board, q, r);
        neighborPieces.forEach((neighbor) => {
          const neighborKey = `${neighbor.q},${neighbor.r},${neighbor.z}`;
          if (!visited.has(neighborKey)) {
            toVisit.push(neighbor);
          }
        });
      });
  
      // Also consider pieces stacked at the same position
      const samePositionPieces = board.filter(
        (p) => p.q === piece.q && p.r === piece.r && p.z !== piece.z
      );
      samePositionPieces.forEach((p) => {
        const pKey = `${p.q},${p.r},${p.z}`;
        if (!visited.has(pKey)) {
          toVisit.push(p);
        }
      });
    }
  
    return visited.size === board.length;
  };
  
  export const canSlide = (board, from, to, piece) => {
    const isAdjacent = getAdjacentCoords(from.q, from.r).some(
      (coord) => coord.q === to.q && coord.r === to.r
    );
    if (!isAdjacent) return false;
  
    if (piece.t === 'beetle') {
      // Beetles can move onto occupied spaces and can move even when completely surrounded
      return true;
    }
  
    // Cannot slide if there's no piece at the from position
    const pieceOnTop = findPieceOnTop(board, from.q, from.r);
    if (!pieceOnTop) return false;
  
    // Cannot slide if the piece is not on ground level
    if (pieceOnTop.z > 0) return false;
  
    // Destination must be empty
    if (findPieceAt(board, to.q, to.r).length > 0) return false;
  
    // Check if the piece is 'pinned' (cannot move out if completely surrounded)
    const fromOccupiedSides = getAdjacentCoords(from.q, from.r).filter(
      (coord) => findPieceAt(board, coord.q, coord.r).length > 0
    ).length;
    if (fromOccupiedSides === 6) return false;
  
    // Implementing the 'Freedom to Move' rule:
    const sharedNeighbors = getAdjacentCoords(from.q, from.r).filter(
      (coord) =>
        getAdjacentCoords(to.q, to.r).some(
          (n) => n.q === coord.q && n.r === coord.r
        )
    );
  
    const blocked = sharedNeighbors.every((coord) =>
      findPieceAt(board, coord.q, coord.r).length > 0
    );
    if (blocked) return false;
  
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
    const isValidMove = (tempBoard, from, to, z = 0) => {
      // Must be able to slide there
      if (!canSlide(tempBoard, from, to, piece)) return false;
  
      // Remove the piece from tempBoard by matching properties
      const newBoard = tempBoard.filter((p) => !isSamePiece(p, piece));
  
      // Add the piece at the new position
      newBoard.push({ ...piece, q: to.q, r: to.r, z });
  
      // Must maintain connectivity
      return isConnected(newBoard);
    };
  
    const tempBoard = board;
  
    if (piece.t === 'queen' || piece.t === 'beetle') {
      const from = { q: piece.q, r: piece.r };
  
      getAdjacentCoords(piece.q, piece.r).forEach((pos) => {
        // For queen, skip occupied spaces
        if (piece.t === 'queen' && findPieceAt(board, pos.q, pos.r).length > 0)
          return;
  
        // For beetle, calculate new height
        const targetPiece = findPieceOnTop(board, pos.q, pos.r);
        const newZ =
          piece.t === 'beetle'
            ? targetPiece
              ? targetPiece.z + 1
              : 0
            : 0;
  
        // For beetle, we need to consider moving onto occupied spaces
        if (
          isValidMove(tempBoard, from, pos, newZ)
        ) {
          moves.add(`${pos.q},${pos.r},${newZ}`);
        }
      });
    }
  
    // Ant movement
    if (piece.t === 'ant') {
      const seen = new Set();
      const queue = [{ q: piece.q, r: piece.r, board: board }];
  
      while (queue.length > 0) {
        const { q, r, board: tempBoard } = queue.shift();
        getAdjacentCoords(q, r).forEach((n) => {
          const key = `${n.q},${n.r}`;
          if (
            !findPieceAt(tempBoard, n.q, n.r).length &&
            !seen.has(key)
          ) {
            const from = { q, r };
            // Create a new board state with the piece at 'from'
            const newTempBoard = tempBoard.filter((p) => !isSamePiece(p, piece));
            newTempBoard.push({ ...piece, q: q, r: r });
  
            if (
              isValidMove(newTempBoard, from, n) &&
              !seen.has(key)
            ) {
              moves.add(`${n.q},${n.r},0`);
              seen.add(key);
              queue.push({ q: n.q, r: n.r, board: newTempBoard });
            }
          }
        });
      }
    }
  
    // Spider movement
    if (piece.t === 'spider') {
      const seen = new Set();
      const startPosKey = `${piece.q},${piece.r}`;
      seen.add(startPosKey);
      let currentPositions = [{ q: piece.q, r: piece.r, board: board, steps: 0 }];
  
      while (currentPositions.length > 0) {
        const { q, r, board: tempBoard, steps } = currentPositions.shift();
        if (steps === 3) continue;
  
        getAdjacentCoords(q, r).forEach((n) => {
          const key = `${n.q},${n.r}`;
          if (
            !findPieceAt(tempBoard, n.q, n.r).length &&
            !seen.has(key)
          ) {
            const from = { q, r };
            // Create a new board state with the piece at 'from'
            const newTempBoard = tempBoard.filter((p) => !isSamePiece(p, piece));
            newTempBoard.push({ ...piece, q: q, r: r });
  
            if (
              isValidMove(newTempBoard, from, n) &&
              !seen.has(key)
            ) {
              seen.add(key);
              if (steps + 1 === 3) {
                moves.add(`${n.q},${n.r},0`);
              } else {
                currentPositions.push({
                  q: n.q,
                  r: n.r,
                  board: newTempBoard,
                  steps: steps + 1,
                });
              }
            }
          }
        });
      }
    }
  
    // Grasshopper movement
    if (piece.t === 'grasshopper') {
      DIRECTIONS.forEach(([dq, dr]) => {
        let q = piece.q + dq;
        let r = piece.r + dr;
        let jumped = false;
  
        while (findPieceAt(board, q, r).length > 0) {
          jumped = true;
          q += dq;
          r += dr;
        }
  
        if (jumped) {
          if (!findPieceOnTop(board, q, r)) {
            // Simulate moving the piece to the landing spot
            const tempBoard = board.filter((p) => !isSamePiece(p, piece));
            tempBoard.push({ ...piece, q, r, z: 0 });
            if (isConnected(tempBoard)) {
              moves.add(`${q},${r},0`);
            }
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
  
    const validMoves = getValidMoves(board, from);
  
    return validMoves.some(
      (move) =>
        move.q === to.q &&
        move.r === to.r &&
        (from.t !== 'beetle' || move.z === to.z)
    );
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
      (uncoveredPieces.length < 2 || neighbors.some((x) => x.p === player)) &&
      neighbors.every((x) => uncoveredPieces.length < 2 || x.p === player) &&
      countPieces(board, type, player) < PIECES[type] &&
      (turn <= 6 || countPieces(board, 'queen', player) > 0 || type === 'queen')
    );
  };
  