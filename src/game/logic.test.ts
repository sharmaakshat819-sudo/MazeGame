import test from 'node:test';
import assert from 'node:assert/strict';
import {
  posEquals,
  isAdjacent,
  validateMove,
  formatTime,
  formatTimeDetailed,
  insertLeaderboardRecord,
  isTopThreeScore,
  DEFAULT_LEADERBOARD,
} from './logic.ts';
import { LEVELS } from './levels.ts';

test('posEquals correctly checks equality', () => {
  assert.equal(posEquals({ x: 1, y: 2 }, { x: 1, y: 2 }), true);
  assert.equal(posEquals({ x: 1, y: 2 }, { x: 2, y: 2 }), false);
});

test('isAdjacent detects 4-directional adjacency', () => {
  assert.equal(isAdjacent({ x: 1, y: 1 }, { x: 1, y: 2 }), true);
  assert.equal(isAdjacent({ x: 1, y: 1 }, { x: 2, y: 1 }), true);
  assert.equal(isAdjacent({ x: 1, y: 1 }, { x: 1, y: 0 }), true);
  assert.equal(isAdjacent({ x: 1, y: 1 }, { x: 0, y: 1 }), true);
  // Diagonal or far
  assert.equal(isAdjacent({ x: 1, y: 1 }, { x: 2, y: 2 }), false);
  assert.equal(isAdjacent({ x: 1, y: 1 }, { x: 3, y: 1 }), false);
  assert.equal(isAdjacent({ x: 1, y: 1 }, { x: 1, y: 1 }), false);
});

test('all 5 levels have valid increasing grid sizes and connected paths', () => {
  assert.equal(LEVELS.length, 5);
  const expectedSizes = [4, 5, 6, 7, 8];

  LEVELS.forEach((level, idx) => {
    assert.equal(level.size, expectedSizes[idx], `Level ${idx + 1} size should be ${expectedSizes[idx]}`);
    assert.ok(level.path.length > 5, `Level ${idx + 1} path should have meaningful length`);

    // Verify start is (0,0) and exit is (size-1, size-1)
    const start = level.path[0];
    const exit = level.path[level.path.length - 1];
    assert.equal(start.x, 0);
    assert.equal(start.y, 0);
    assert.equal(exit.x, level.size - 1);
    assert.equal(exit.y, level.size - 1);

    // Verify all steps are within bounds and adjacent
    const visited = new Set<string>();
    for (let i = 0; i < level.path.length; i++) {
      const p = level.path[i];
      assert.ok(p.x >= 0 && p.x < level.size, `Point ${i} x out of bounds in level ${level.level}`);
      assert.ok(p.y >= 0 && p.y < level.size, `Point ${i} y out of bounds in level ${level.level}`);

      const key = `${p.x},${p.y}`;
      assert.ok(!visited.has(key), `Point ${key} is duplicated in level ${level.level}`);
      visited.add(key);

      if (i > 0) {
        const prev = level.path[i - 1];
        assert.ok(
          isAdjacent(prev, p),
          `Step ${i - 1} to ${i} not adjacent in level ${level.level}`
        );
      }
    }
  });
});

test('validateMove allows sequential safe forward steps and backtracks', () => {
  const lvl1 = LEVELS[0];
  // Start at (0,0) index 0
  const step1 = validateMove(lvl1.path, 0, { x: 1, y: 0 }, lvl1.size);
  assert.equal(step1.valid, true);
  assert.equal(step1.nextIndex, 1);
  assert.equal(step1.isExit, false);

  // Illegal move off path (e.g. going down to (0,1) instead of (1,0))
  const badStep = validateMove(lvl1.path, 0, { x: 0, y: 1 }, lvl1.size);
  assert.equal(badStep.valid, false);

  // Backtrack from index 1 back to 0
  const backtrack = validateMove(lvl1.path, 1, { x: 0, y: 0 }, lvl1.size);
  assert.equal(backtrack.valid, true);
  assert.equal(backtrack.nextIndex, 0);
  assert.equal(backtrack.isBacktrack, true);

  // Final step reaches exit
  const lastIndex = lvl1.path.length - 2;
  const finalStep = validateMove(
    lvl1.path,
    lastIndex,
    lvl1.path[lvl1.path.length - 1],
    lvl1.size
  );
  assert.equal(finalStep.valid, true);
  assert.equal(finalStep.isExit, true);
});

test('leaderboard ranking sorts fastest first', () => {
  const initial = [...DEFAULT_LEADERBOARD];
  assert.equal(initial.length, 3);

  // Top score test
  const isTop = isTopThreeScore(initial, 35000); // 35 seconds is faster than seed-1 (44.25s)
  assert.equal(isTop, true);

  const newFastest = {
    id: 'test-1',
    name: 'TEST_CHAMP',
    timeMs: 35000,
    moves: 60,
    date: '2026-10-19',
  };

  const updated = insertLeaderboardRecord(initial, newFastest);
  assert.equal(updated.length, 3);
  assert.equal(updated[0].name, 'TEST_CHAMP');
  assert.equal(updated[0].timeMs, 35000);
  assert.equal(updated[1].name, 'NEO_VEX');
  assert.equal(updated[2].name, 'PULSE_9');

  // Slow score should not enter top 3
  const slowScore = {
    id: 'test-slow',
    name: 'TURTLE',
    timeMs: 999999,
    moves: 120,
    date: '2026-10-19',
  };
  const stillSame = insertLeaderboardRecord(updated, slowScore);
  assert.equal(stillSame.length, 3);
  assert.equal(stillSame.some((r) => r.name === 'TURTLE'), false);
});

test('formatting functions handle time properly', () => {
  assert.equal(formatTime(65400), '01:05.4');
  assert.equal(formatTime(9200), '00:09.2');
  assert.equal(formatTimeDetailed(65430), '01:05.43');
});
