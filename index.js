'use strict'

const _ = require('lodash')

/**
 * @todo создать гитхаб репо
 * опубликовать NPM
 *
 * Recursively traverse collection (Object/Array etc)
 *
 * @param {object|array} collection - Object/Array for traversing.
 * @param {function} customizerCallback - Called for every key. Get 4 params: (value, key, path, newCollection).
 *
 * @returns {object} - New Collection
 */
module.exports = function walkCollectionTree(collection, customizerCallback) {
	if (!_.isFunction(customizerCallback)) {
		throw new Error('Customizer must be a function!')
	}
	if (!_.isObject(collection)) {
		return collection
	}

	/**
	 * Walk through object tree.
	 */
	function traverseRecursive(collection, newCollection, stack = []) {
		_.forEach(collection, (value, key) => {
			const path = stack.concat(key)

			/**
			 * <- { value, key, path, remove, skip } - all keys them are optional.
			 *
			 * Use { skip: true } for not traversing colection (for improving performance etc).
			 * Use { remove: true } for not adding property to new collection.
			 *
			 * [...path] - for path array immutability.
			 */
			const customizerData = customizerCallback(value, key, [...path], newCollection) || {}

			/**
			 * We must use 'hasOwnProperty' instead of destructuring with default values
			 * so that, we can pass { value: undefined } from customizer.
			 */
			const finalValue = customizerData.hasOwnProperty('value') ? customizerData.value : value
			const finalPath = customizerData.hasOwnProperty('path') ? customizerData.path : path

			/**
			 * If we pass 'key' in customizer - update path for this property.
			 */
			if (customizerData.key) {
				finalPath[finalPath.length - 1] = customizerData.key
			}

			/**
			 * Main logic.
			 */
			if (_.isObject(value) && !customizerData.skip) {
				/**
				 * Recreating collection structure (schema).
				 * Without this empty property and property without primitives will no be added.
				 */
				if (_.isEmpty(value) && !customizerData.remove) {
					return _.set(newCollection, finalPath, _.isArray(value) ? [] : {})
				}
				/**
				 * Recurcive call to traverse nested collection.
				 */
				traverseRecursive(value, newCollection, path)
			} else if (!customizerData.remove) {
				/**
				 * Processing primitive values or skipped collection.
				 */
				_.set(newCollection, finalPath, finalValue)
			}
		})

		return newCollection
	}

	/**
	 * In second argument we determine if we start from Array or Object.
	 */
	return traverseRecursive(collection, _.isArray(collection) ? [] : {})
}
