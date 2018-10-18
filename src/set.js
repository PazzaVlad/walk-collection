'use strict'

const isObject = (value) => {
	const type = typeof value
	return value != null && (type == 'object' || type == 'function')
}

/**
 * Base on https://github.com/lodash/lodash/blob/master/.internal/baseSet.js. 
 * - Faster.
 * - Works only with 'path' as array
 * - Always treat strings in 'path' as object property and numbers as array indexes.
 */
module.exports = function set(object, path, value) {
	if (!isObject(object)) {
		return object
	}

	let nested = object

	const length = path.length
	const lastIndex = length - 1

	for (let index = 0; index < length; index++) {
		const key = path[index]
		let newValue = value

		if (index != lastIndex) {
			const objValue = nested[key]
			newValue = isObject(objValue) ? objValue : typeof path[index + 1] === 'number' ? [] : {}
		}

		nested[key] = newValue
		nested = nested[key]
	}

	return object
}
