const assert = require('assert').strict
const _ = require('lodash')

const traverseTree = require('./../index')

/**
 * General data
 */

const generalPassedCollection = {
	rootNumeber: 3,
	treeWithoutPrimitive: { some: { other: { another: {} } } },
	treeNormal: {
		coolKey: {
			otherOne: {
				another: {
					num: 34,
					str: 'some string',
					array: [1, 2, 3, 4, 5],
					bool: false,
					undef: undefined,
					null: null,
				},
			},
			otherTwo: ['word', 'sun', 'good', 'super'],
		},
	},
	treeArrayWithObjects: [
		{ some: 1, other: 'nice 2', obj: { some: true } },
		{ some: 2, other: 'nice 2' },
		{ some: 2, other: 'nice 2' },
	],
}

/**
 * Real Use Cases
 */

describe('Real Use Cases', function() {
	it('change value', function() {
		const collection = {
			one: undefined,
			obj: { some: 86, other: 'str', another: false, zero: 0, last: null },
			arr: [34, false, null],
		}

		const result = traverseTree(collection, (value, key, path) => {
			if (_.isNumber(value)) {
				return { value: value * 2 }
			}
		})

		const expected = {
			one: undefined,
			obj: { some: 172, other: 'str', another: false, zero: 0, last: null },
			arr: [68, false, null],
		}

		assert.deepEqual(result, expected)
	})

	it('change key', function() {
		const collection = {
			obj: { some: 86, other: 'str', data: { ok: true } },
			arr: [1, 2, 3, 4],
		}

		const result = traverseTree(collection, (value, key, path) => {
			// If key if object key, not an array index
			if (typeof key === 'string') {
				return { key: key.toUpperCase() }
			}
		})

		const expected = {
			OBJ: { SOME: 86, OTHER: 'str', DATA: { OK: true } },
			ARR: [1, 2, 3, 4],
		}

		assert.deepEqual(result, expected)
	})

	it('remove branches without primitive', function() {
		const result = traverseTree(generalPassedCollection, (value, key, path) => {
			if (_.isObject(value) && _.isEmpty(value)) {
				return { remove: true }
			}
		})

		const expected = _.omit(generalPassedCollection, 'treeWithoutPrimitive')

		assert.deepEqual(result, expected)
	})

	it('remove falsy properties', function() {
		const collection = {
			one: undefined,
			obj: { some: 86, other: 'str', another: false, zero: 0, last: null },
			arr: [34, false, null],
		}

		const result = traverseTree(collection, (value, key, path) => {
			if (!value) {
				return { remove: true }
			}
		})

		const expected = {
			obj: { some: 86, other: 'str' },
			arr: [34],
		}

		assert.deepEqual(result, expected)
	})

	it('skip nested object tree traversing', function() {
		let conuter = 0
		const result = traverseTree(generalPassedCollection, (value, key, path) => {
			if (key === 'coolKey') {
				return { skip: true }
			}
			if (path[1] === 'coolKey') {
				conuter = conuter + 1
			}
		})

		assert.deepEqual(conuter, 0)
	})

	it('compare leaf nodes', function() {
		const collection = {
			num: 3,
			treeWithoutPrimitive: { some: { other: { another: {} } } },
			specs: { gpu: 1200, memory: 2048, type: 'GDDR5', shared: false },
			games: [{ gta: 42 }, { witcher: 23 }],
			tech: ['sli', 'crossfire', 'g-sync'],
		}

		const result = traverseTree(collection, (value, key, path) => {
			if (key === 'tech') {
				return { skip: true, value: [value, value] }
			}
			if (!_.isObject(value)) {
				return { value: [value, value] }
			}
		})

		const expected = {
			num: [3, 3],
			treeWithoutPrimitive: { some: { other: { another: {} } } },
			specs: {
				gpu: [1200, 1200],
				memory: [2048, 2048],
				type: ['GDDR5', 'GDDR5'],
				shared: [false, false],
			},
			games: [{ gta: [42, 42] }, { witcher: [23, 23] }],
			tech: [['sli', 'crossfire', 'g-sync'], ['sli', 'crossfire', 'g-sync']],
		}

		assert.deepEqual(result, expected)
	})

	it('flatten and unflatten collection', function() {
		const resultFlatten = traverseTree(generalPassedCollection, (value, key, path) => {
			return { path: [path.join('.')] }
		})

		const resultUnflatten = traverseTree(resultFlatten, (value, key, path) => {
			/**
			 * We use Number(v) for converting numeric kes to array.
			 */
			return { path: key.split('.').map(v => isNaN(Number(v)) ? v : Number(v) )}
		})

		assert.deepEqual(generalPassedCollection, resultUnflatten)
	})
})

/**
 * General cases
 */

describe('General', function() {
	it('deep collection copy', function() {
		const result = traverseTree(generalPassedCollection, (value, key, path) => {})

		result.rootNumeber = null
		result.treeArrayWithObjects[0].some = 'immutable'

		assert.deepEqual(generalPassedCollection.rootNumeber, 3)
		assert.deepEqual(generalPassedCollection.treeArrayWithObjects[0].some, 1)
	})

	it('correctly process collection with numeric keys', function() {
		const collection = { data: {
			'2018': [
				{ price: 0.663861},
				{ price: 0.75196 },
				{ price: 0.754964 },
				{ price: 0.62916 },
				{ price: 0.753221 },
			],
			'2019': [
				{ price: 0.788176 },
				{ price: 0.790759 },
				{ price: 0.856103 },
				{ price: 0.867188 },
			],
		}}

		const result = traverseTree(collection, (value, key, path) => {})

		assert.deepEqual(collection, result)
	})

	it('returns same collection for empty customizer', function() {
		const array = [4, 'good', { some: { other: false } }]

		assert.deepEqual(
			traverseTree(generalPassedCollection, (value, key, path) => {}),
			generalPassedCollection
		)
		assert.deepEqual(traverseTree(array, (value, key, path) => {}), array)
		assert.deepEqual(traverseTree({}, (value, key, path) => {}), {})
		assert.deepEqual(traverseTree([], (value, key, path) => {}), [])
	})

	it('returns passed value if value is primitive', function() {
		assert.deepEqual(traverseTree(null, (value, key, path) => {}), null)
		assert.deepEqual(traverseTree(undefined, (value, key, path) => {}), undefined)
		assert.deepEqual(traverseTree(5, (value, key, path) => {}), 5)
		assert.deepEqual(traverseTree('hello', (value, key, path) => {}), 'hello')
	})
})
