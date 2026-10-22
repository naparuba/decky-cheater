import test from 'node:test'
import assert from 'node:assert/strict'
import { ValueTypes } from '../src/classes.js'
import { gradientValues } from '../src/lib/gradient.js'

const { Int8, Int16, Int32, Int64, Float32, Float64 } = ValueTypes

test('a positive value goes down by one on each result', () => {
  assert.deepEqual(gradientValues('87', Int32, 5), ['87', '86', '85', '84', '83'])
})

test('the roller gives a sign and leading zeros', () => {
  assert.deepEqual(gradientValues('+0000000087', Int32, 3), ['87', '86', '85'])
  assert.deepEqual(gradientValues('-0000000005', Int32, 3), ['-5', '-6', '-7'])
})

test('a positive value stops at zero, it never turns negative', () => {
  assert.deepEqual(gradientValues('3', Int32, 6), ['3', '2', '1', '0', '0', '0'])
  assert.deepEqual(gradientValues('1', Int64, 3), ['1', '0', '0'])
})

test('a negative value goes away from zero and stops at the minimum of the type', () => {
  assert.deepEqual(gradientValues('-126', Int8, 5), ['-126', '-127', '-128', '-128', '-128'])
  assert.deepEqual(gradientValues('-32767', Int16, 3), ['-32767', '-32768', '-32768'])
  assert.deepEqual(gradientValues('-2147483647', Int32, 3), ['-2147483647', '-2147483648', '-2147483648'])
  assert.deepEqual(gradientValues('-9223372036854775807', Int64, 3), [
    '-9223372036854775807',
    '-9223372036854775808',
    '-9223372036854775808',
  ])
})

test('large positive values keep their precision', () => {
  assert.deepEqual(gradientValues('18446744073709551615', Int64, 3), [
    '18446744073709551615',
    '18446744073709551614',
    '18446744073709551613',
  ])
  assert.deepEqual(gradientValues('255', Int8, 3), ['255', '254', '253'])
})

test('floats use the same step of one', () => {
  assert.deepEqual(gradientValues('87.5', Float32, 4), ['87.5', '86.5', '85.5', '84.5'])
  assert.deepEqual(gradientValues('2.5', Float64, 5), ['2.5', '1.5', '0.5', '0', '0'])
  assert.deepEqual(gradientValues('-1.5', Float64, 3), ['-1.5', '-2.5', '-3.5'])
})

test('no gradient from zero, from text, or without result', () => {
  assert.equal(gradientValues('0', Int32, 5), null)
  assert.equal(gradientValues('+0000', Int32, 5), null)
  assert.equal(gradientValues('0.0', Float32, 5), null)
  assert.equal(gradientValues('', Int32, 5), null)
  assert.equal(gradientValues('abc', Int32, 5), null)
  assert.equal(gradientValues('1.5', Int32, 5), null)
  assert.equal(gradientValues('87', Int32, 0), null)
})
