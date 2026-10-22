import test from 'node:test'
import assert from 'node:assert/strict'
import { MIN_LEGEND_SCALE, legendScale } from '../src/lib/legend.js'

test('a row that fits is left as it is', () => {
  assert.equal(legendScale(300, 328), 1)
  assert.equal(legendScale(328, 328), 1)
})

test('a row that is too wide is shrunk to the width of the panel', () => {
  assert.equal(legendScale(400, 320), 0.8)
  assert.ok(Math.abs(legendScale(368, 328) - 328 / 368) < 1e-9)
})

test('the text never gets smaller than the limit', () => {
  assert.equal(legendScale(1000, 300), MIN_LEGEND_SCALE)
})

test('nothing to measure, nothing to scale', () => {
  assert.equal(legendScale(0, 328), 1)
  assert.equal(legendScale(400, 0), 1)
})
