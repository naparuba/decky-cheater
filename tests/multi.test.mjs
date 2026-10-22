import test from 'node:test'
import assert from 'node:assert/strict'
import { ValueTypes } from '../src/classes.js'
import { canKeepOnly, hasUsableResults, isParked, pickSelectedType, toResults, truncatedTypes } from '../src/lib/multi.js'

const { Int16, Int32, Int64, Float32, Float64 } = ValueTypes

const type = (Type, Count, Status = 'ok', List = null) => ({ Type, Name: ValueTypes[Type], Count, Status, List })
const multi = (...Types) => ({ Types, Round: 2, Time: '3ms', CanUndo: true })

test('keeps the type being looked at while it has results', () => {
  const m = multi(type(Int32, 3, 'ok', [['A', '1']]), type(Int64, 5, 'ok', [['B', '1']]))
  assert.equal(pickSelectedType(m, Int64), Int64)
  assert.equal(pickSelectedType(m, Int32), Int32)
})

test('leaves a type that has nothing left', () => {
  for (const status of ['empty', 'dropped', 'truncated']) {
    const m = multi(type(Int32, 0, status), type(Int64, 5, 'ok', [['B', '1']]))
    assert.equal(pickSelectedType(m, Int32), Int64, status)
  }
  // results that exist but status says they are gone
  assert.equal(pickSelectedType(multi(type(Int32, 4, 'dropped'), type(Int64, 1, 'ok', [['B', '1']])), Int32), Int64)
})

test('without a current type, prefers a type that can be listed', () => {
  const m = multi(type(Int16, 4000000, 'parked'), type(Int32, 12, 'ok', [['A', '1']]), type(Int64, 3, 'ok', [['B', '1']]))
  assert.equal(pickSelectedType(m, null), Int32)
})

test('a parked type can be selected when nothing can be listed', () => {
  const m = multi(type(Int16, 4000000, 'parked'), type(Float32, 0, 'empty'))
  assert.equal(pickSelectedType(m, null), Int16)
  assert.equal(pickSelectedType(m, Float32), Int16)
})

test('nothing usable: no selection', () => {
  assert.equal(pickSelectedType(multi(type(Int32, 0, 'empty'), type(Int64, 0, 'dropped')), Int32), null)
  assert.equal(pickSelectedType(multi(), null), null)
})

test('hasUsableResults', () => {
  assert.equal(hasUsableResults(null), false)
  assert.equal(hasUsableResults(multi(type(Int32, 0, 'empty'))), false)
  assert.equal(hasUsableResults(multi(type(Int32, 0, 'empty'), type(Int64, 2))), true)
  assert.equal(hasUsableResults(multi(type(Int64, 9, 'dropped'))), false)
  assert.equal(hasUsableResults(multi(type(Int16, 4000000, 'parked'))), true)
})

test('toResults gives the list view of one type', () => {
  const list = [['147551B0', '1000']]
  const m = multi(type(Int32, 12, 'ok', list), type(Int64, 3))
  assert.deepEqual(toResults(m, Int32), { Count: 12, List: list, Round: 2, Time: '3ms', CanUndo: true })
  // a type that is parked or has no list: a count and an empty list, never null
  assert.deepEqual(toResults(m, Int64), { Count: 3, List: [], Round: 2, Time: '3ms', CanUndo: true })
  assert.deepEqual(toResults(m, null), { Count: 0, List: [], Round: 2, Time: '3ms', CanUndo: true })
  assert.deepEqual(toResults(m, Float64), { Count: 0, List: [], Round: 2, Time: '3ms', CanUndo: true })
})

test('keep only is offered on a type with results when another type has some too', () => {
  const m = multi(type(Int32, 3, 'ok', [['A', '1']]), type(Int64, 5, 'ok', [['B', '1']]), type(Float32, 0, 'empty'))
  assert.equal(canKeepOnly(m, Int32), true)
  assert.equal(canKeepOnly(m, Int64), true)
})

test('keep only is not offered on a type that has nothing left', () => {
  const m = multi(type(Int32, 3), type(Int64, 5), type(Float32, 0, 'empty'), type(Float64, 4, 'dropped'))
  assert.equal(canKeepOnly(m, Float32), false)
  assert.equal(canKeepOnly(m, Float64), false)
})

test('keep only is not offered when no other type has results: nothing to drop', () => {
  const alone = multi(type(Int32, 3), type(Int64, 0, 'empty'), type(Float32, 4, 'dropped'))
  assert.equal(canKeepOnly(alone, Int32), false)
  // a parked type counts as having results
  const withParked = multi(type(Int32, 3), type(Int16, 4000000, 'parked'))
  assert.equal(canKeepOnly(withParked, Int32), true)
  assert.equal(canKeepOnly(withParked, Int16), true)
})

test('keep only: nothing without results, nor for an unknown type', () => {
  assert.equal(canKeepOnly(null, Int32), false)
  assert.equal(canKeepOnly(multi(type(Int32, 3), type(Int64, 5)), Float64), false)
  assert.equal(canKeepOnly(multi(), Int32), false)
})

test('truncatedTypes names the types whose results were dropped', () => {
  const m = multi(type(Int32, 3), type(Int16, 0, 'truncated'), type(Int64, 0, 'truncated'), type(Float32, 0, 'empty'))
  assert.deepEqual(truncatedTypes(m), ['Int16', 'Int64'])
  assert.deepEqual(truncatedTypes(multi(type(Int32, 3))), [])
})

test('isParked: the listed type has too many results to list', () => {
  const m = multi(type(Int16, 4000000, 'parked'), type(Int32, 3))
  assert.equal(isParked(m, Int16), true)
  assert.equal(isParked(m, Int32), false)
  assert.equal(isParked(m, null), false)
  assert.equal(isParked(null, Int16), false)
})
