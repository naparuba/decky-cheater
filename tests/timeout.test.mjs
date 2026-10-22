import test from 'node:test'
import assert from 'node:assert/strict'
import { BackendTimeout, SCAN_TIMEOUT_MS, withTimeout } from '../src/lib/timeout.js'

test('a call that answers in time gives its value', async () => {
  assert.equal(await withTimeout(Promise.resolve(42), 1000), 42)
})

test('a call that fails fails the same way, at once', async () => {
  const error = new Error('python exception')
  await assert.rejects(withTimeout(Promise.reject(error), 1000), error)
})

test('a call that never answers gives up with a BackendTimeout', async () => {
  const started = Date.now()
  await assert.rejects(withTimeout(new Promise(() => {}), 30), error => {
    assert.ok(error instanceof BackendTimeout)
    assert.equal(error.ms, 30)
    return true
  })
  assert.ok(Date.now() - started < 1000)
})

test('a late answer is dropped, not thrown', async () => {
  const late = new Promise(resolve => setTimeout(() => resolve('late'), 60))
  await assert.rejects(withTimeout(late, 20), BackendTimeout)
  await late // the late value arrives: nothing happens
})

test('the timer is cleared once the call is done (nothing keeps the process alive)', async () => {
  // if the 60 s timer of SCAN_TIMEOUT_MS were left running, the test run would not end
  for (let i = 0; i < 20; i++) {
    await withTimeout(Promise.resolve(i), SCAN_TIMEOUT_MS)
  }
})

test('the limit is generous for a scan and short for a user', () => {
  assert.ok(SCAN_TIMEOUT_MS >= 10_000 && SCAN_TIMEOUT_MS <= 120_000)
})
