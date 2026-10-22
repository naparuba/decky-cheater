import test from 'node:test'
import assert from 'node:assert/strict'
import { NUM_SLOTS, SLOT_LINE_OPACITY, nextSlot, slotLineState } from '../src/lib/slots.js'

test('there are three slots', () => {
  assert.equal(NUM_SLOTS, 3)
})

test('R1 goes forward and comes back to the first after the last', () => {
  assert.equal(nextSlot(0, 1), 1)
  assert.equal(nextSlot(1, 1), 2)
  assert.equal(nextSlot(2, 1), 0)
})

test('L1 goes back and comes to the last from the first', () => {
  assert.equal(nextSlot(2, -1), 1)
  assert.equal(nextSlot(1, -1), 0)
  assert.equal(nextSlot(0, -1), 2)
})

test('the line of a slot tells whether it is shown, holds a search or is empty', () => {
  assert.equal(slotLineState(1, 1, false), 'active')
  assert.equal(slotLineState(1, 1, true), 'active')
  assert.equal(slotLineState(0, 1, true), 'filled')
  assert.equal(slotLineState(2, 1, false), 'empty')
})

test('the lines get paler from the shown slot to an empty one', () => {
  assert.ok(SLOT_LINE_OPACITY.active > SLOT_LINE_OPACITY.filled)
  assert.ok(SLOT_LINE_OPACITY.filled > SLOT_LINE_OPACITY.empty)
  assert.ok(SLOT_LINE_OPACITY.empty > 0)
})
