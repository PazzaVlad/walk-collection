'use strict'

const _ = require('lodash')

const traverseTree = require('./../index')

function generateSampleObject() {
	const arrayWithStrings = _.times(500, (i) => `some data ${i}`)
	const arrayWithNumbers = _.times(500, (i) => i + 5 * 15)
	const obj = _.zipObject(arrayWithStrings, arrayWithNumbers)
	const nestedData = {
		fake: 4,
		fake2: 45,
		someStr: 'some data',
		Obg1: {
			time: Date.now(),
			arr: [4, 5, 5],
			str: 'some str',
			Obj2: {
				time2: Date.now(),
				arr2: [4, 5, { cool: 1, suped: 2 }],
			},
		},
	}
	const nestedArr = _.times(100, (i) => _.times(15, (x) => nestedData))

	return {
		...obj,
		arrayWithStrings,
		arrayWithNumbers,
		nestedArr,
	}
}

function runBenchmark(sampleObject, iterations = 20) {
	const hrstart = process.hrtime()

	let traversedItems = 0
	for (let i = 0; i < iterations; i++) {
		traverseTree(sampleObject, (value, key, path) => {
			traversedItems++
		})
	}

	const hrend = process.hrtime(hrstart)

	console.info(
		`Traversed ${traversedItems / iterations} items ${iterations} times in ${hrend[0]}s ${hrend[1] / 1000000}ms (Average ${hrend[1] / 1000000 / 20}s)`
	)
}

runBenchmark(generateSampleObject(), 20)
