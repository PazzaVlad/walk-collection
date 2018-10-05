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
			 * [...path] - for path array immutability.
			 */
			const customizerData = customizerCallback(value, key, [...path], newCollection) || {}

			let {
				value: finalValue = value,
				path: finalPath = path,
				key: customizerKey,
				remove: customizerRemoveProperty,
				/**
				 * We can use 'skip: true' if we don't wanna traverse colection and add it 'as is'
				 * for example for improving performance.
				 */
				skip: customizerSkipCollection,
			} = customizerData

			/**
			 * If we pass 'key' in customizer - update path for this property.
			 */
			if (customizerKey) {
				finalPath[finalPath.length - 1] = customizerKey
			}

			/**
			 * Start create properties for new collection.  
			 */
			if (_.isObject(value) && !customizerSkipCollection) {
				/**
				 * Recreating collection structure (schema).
				 * Without this empty property and property without primitives will no be added.
				 */
				if (_.isEmpty(value) && !customizerRemoveProperty) {
					return _.set(newCollection, finalPath, _.isArray(value) ? [] : {})
				}
				/**
				 * Recurcive call to traverse nested collection.
				 */
				traverseRecursive(value, newCollection, path)
			} else if (!customizerRemoveProperty) {
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
