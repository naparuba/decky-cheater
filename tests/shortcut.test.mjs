import test from 'node:test'
import assert from 'node:assert/strict'
import { pickFreezeAllAction, pickScanAction } from '../src/lib/shortcut.js'

const pick = (firstScannable, nextScannable, loading = false) =>
  pickScanAction({ loading, firstScannable, nextScannable })

test('first scan when it is the only one available', () => {
  assert.equal(pick(true, false), 'first')
})

test('next scan when it is the one available', () => {
  assert.equal(pick(false, true), 'next')
})

test('nothing when neither is available', () => {
  assert.equal(pick(false, false), null)
})

test('nothing while a scan is running, whatever is available', () => {
  assert.equal(pick(true, false, true), null)
  assert.equal(pick(false, true, true), null)
})

test('first scan wins if both were available', () => {
  assert.equal(pick(true, true), 'first')
})

test('X on the roller: freeze all, or unfreeze all as soon as one is frozen', () => {
  assert.equal(pickFreezeAllAction(0, 5), 'freeze')
  assert.equal(pickFreezeAllAction(1, 5), 'unfreeze')
  assert.equal(pickFreezeAllAction(5, 5), 'unfreeze')
})

test('X on the roller does nothing without results', () => {
  assert.equal(pickFreezeAllAction(0, 0), null)
  assert.equal(pickFreezeAllAction(3, 0), null)
})
