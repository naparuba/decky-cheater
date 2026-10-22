import test from 'node:test'
import assert from 'node:assert/strict'
import { ValueTypes } from '../src/classes.js'
import { candidateTypes, formatCount, typesMask, typesToSearch } from '../src/lib/candidates.js'

const { Int8, Int16, Int32, Int64, Float32, Float64 } = ValueTypes
const ALL = [Int8, Int16, Int32, Int64, Float32, Float64]

// The same table as TestParseCandidatesTypes of the backend (memscan): what
// the plugin shows before the scan must be what the backend searches.
const table = [
  ['100', ALL],
  ['255', ALL],
  ['256', [Int16, Int32, Int64, Float32, Float64]],
  ['65535', [Int16, Int32, Int64, Float32, Float64]],
  ['65536', [Int32, Int64, Float32, Float64]],
  ['16777216', [Int32, Int64, Float32, Float64]],
  ['16777217', [Int32, Int64, Float64]],
  ['4294967295', [Int32, Int64, Float64]],
  ['4294967296', [Int64, Float64]],
  ['9007199254740992', [Int64, Float64]],
  ['9007199254740993', [Int64]],
  ['18446744073709551615', [Int64]],
  ['18446744073709551616', []],
  ['+5', ALL],
  ['007', ALL],
  ['  42  ', ALL],
  ['-1', ALL],
  ['-128', ALL],
  ['-129', [Int16, Int32, Int64, Float32, Float64]],
  ['-32769', [Int32, Int64, Float32, Float64]],
  ['-2147483649', [Int64, Float64]],
  ['-9223372036854775808', [Int64]],
  ['-9223372036854775809', []],
  ['3.5', [Float32, Float64]],
  ['-3.5', [Float32, Float64]],
  ['.5', [Float32, Float64]],
  ['5.', [Float32, Float64]],
  ['1e3', [Float32, Float64]],
  ['1E-3', [Float32, Float64]],
  ['1e50', [Float64]],
  ['1e-50', [Float64]],
  ['1e400', []],
  ['', []],
  ['   ', []],
  ['abc', []],
  ['12abc', []],
  ['1,5', []],
  ['0x10', []],
  ['0x1p-2', []],
  ['1_000', []],
  ['NaN', []],
  ['inf', []],
  ['-Inf', []],
  ['--5', []],
  ['+-5', []],
  ['1-5', []],
  ['1.2.3', []],
  ['e', []],
  ['.', []],
  ['-', []],
]

for (const [input, want] of table) {
  test(`candidateTypes(${JSON.stringify(input)}) refusing zero`, () => {
    assert.deepEqual(candidateTypes(input, false), want)
  })
}

test('zero is accepted only when asked', () => {
  for (const input of ['0', '000', '-0', '+0']) {
    assert.deepEqual(candidateTypes(input, false), [], input)
    assert.deepEqual(candidateTypes(input, true), ALL, input)
  }
  for (const input of ['0.0', '0e5', '-0.0']) {
    assert.deepEqual(candidateTypes(input, false), [], input)
    assert.deepEqual(candidateTypes(input, true), [Float32, Float64], input)
  }
})

test('what the roller produces is understood: sign slot and leading zeros', () => {
  assert.deepEqual(candidateTypes('+0000000000000001000', false), [Int16, Int32, Int64, Float32, Float64])
  assert.deepEqual(candidateTypes('-0000000000000000005', false), ALL)
  assert.deepEqual(candidateTypes('+000000000000012.5', false), [Float32, Float64])
})

test('typesToSearch: automatic keeps the candidates, manual restricts them', () => {
  const candidates = [Int16, Int32, Int64, Float32, Float64]
  assert.deepEqual(typesToSearch(candidates, []), candidates)
  assert.deepEqual(typesToSearch(candidates, [Float32, Int64]), [Int64, Float32])
  // forced types that cannot hold the value are not searched
  assert.deepEqual(typesToSearch(candidates, [Int8, Int32]), [Int32])
  assert.deepEqual(typesToSearch(candidates, [Int8]), [])
})

test('typesMask: one bit per type number, like the backend', () => {
  assert.equal(typesMask([]), 0)
  assert.equal(typesMask([Int8]), 1 << 1)
  assert.equal(typesMask([Int32, Float32]), (1 << 3) | (1 << 5))
  assert.equal(typesMask(ALL), 0b1111110)
})

test('formatCount keeps the chips short', () => {
  assert.equal(formatCount(0), '0')
  assert.equal(formatCount(12), '12')
  assert.equal(formatCount(9999), '9999')
  assert.equal(formatCount(12000), '12K')
  assert.equal(formatCount(15500), '15.5K')
  assert.equal(formatCount(4200000), '4.2M')
  assert.equal(formatCount(32000000), '32M')
  assert.equal(formatCount(150000000), '150M')
})
