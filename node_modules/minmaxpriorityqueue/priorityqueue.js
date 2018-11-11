/*Copyright (c) 2015 Jelle Stege

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.*/
/**
 * PriorityQueue, a priority queue implementation in Javascript.
 * Supports queueing, dequeuing, peeking and removing
 * elements from the queue by value.
 *
 * @author jstege1206@gmail.com (Jelle Stege)
 */
if (typeof net === 'undefined') {
  var net = {};
}
if (!('jstege1206' in net)) {
  /**
   * Create namespace
   * @type {{}}
   */
  net.jstege1206 = {};
}

(function() {
  'use strict';

  /**
   * Default comparator, returns < 0 if b > a, > 0 if a > b and 0 if a == b.
   * Null values are always bigger than non null values, resulting in null
   * values being sorted to the end.
   * @param {*} a The first object.
   * @param {*} b the second object.
   * @return {number} The value representing the comparison.
   */
  var DEFAULT_COMPARATOR = function(a, b) {
    if (a == null) {
      return 1;
    }
    if (b == null) {
      return -1;
    }
    return a - b;
  };

  /**
   * Default equals function, returns true if a == b. False if otherwise.
   * @param {*} a First object.
   * @param {*} b Second object.
   * @return {boolean} True if a and b are equal, false if otherwise.
   */
  var DEFAULT_EQUALS = function(a, b) {
    return a == b;
  };

  /**
   * PriorityQueue constructor, constructs a new PriorityQueue. Options are a
   * simple JSON object with argument names. Argument names include:
   *  - comparator: The comparator to use, uses same implementation as the
   *      compareFunction implementation in Array.prototype.sort().
   *  - equals: The equals function to use.
   *  - capacity: The capacity of the queue, defines the maximum size of the
   *      queue. When the queue exceeds this size any new additions will
   *      throw an error.
   *  - data: The initial data to be used for the queue. Accepts any
   *  iterable object.
   * @param {*} options options object,
   * @constructor
   */
  function PriorityQueue(options) {
    this.queue = [];
    this.queueLength = 0;
    if (typeof options != 'undefined' && 'comparator' in options &&
        typeof options.comparator == 'function') {
      this.comparator = options.comparator;
    } else {
      this.comparator = DEFAULT_COMPARATOR;
    }

    if (typeof options != 'undefined' && 'equals' in options &&
        typeof options.equals == 'function') {
      this.equals = options.equals;
    } else {
      this.equals = DEFAULT_EQUALS;
    }

    if (typeof options != 'undefined' && 'data' in options &&
        typeof options.data == 'object') {
      this.setData(options.data, options.data.length);
    }
  }

  /**
   * Clears whole queue, removing all elements from it.
   */
  PriorityQueue.prototype.clear = function() {
    this.queue = [];
    this.queueLength = 0;
  };

  /**
   * Returns the first object in the queue, without removing it.
   * @return {*} The first object in the queue.
   */
  PriorityQueue.prototype.peek = function() {
    if (this.queueLength == 0) {
      return null;
    }
    return this.queue[0];
  };

  /**
   * Returns the first object in the queue and removes it from the queue.
   * @return {*} The first object in the queue.
   */
  PriorityQueue.prototype.poll = function() {
    if (this.queueLength == 0) {
      return null;
    }
    this.queueLength--;
    var result = this.queue[0];
    var lastElement = this.queue[this.queueLength];
    delete this.queue[this.queueLength];
    if (this.queueLength != 0) {
      _siftDown(0, lastElement, this.queue, this.queueLength, this.comparator);
    }
    return result;
  };

  /**
   * Adds an object to the queue.
   * @param {*} obj The object to store in the queue.
   */
  PriorityQueue.prototype.offer = function(obj) {
    _siftUp(this.queueLength++, obj, this.queue, this.comparator);
  };

  /**
   * Removes an item from the queue by using the given object as identifier.
   * Will use the equals function of this PriorityQueue object to compare
   * objects.
   * @param {*} obj The object to remove.
   * @return {boolean} False if object was not found, true if it was found.
   * and removed.
   */
  PriorityQueue.prototype.remove = function(obj) {
    var index = _indexOf(obj, this.queue, this.queueLength, this.equals);
    if (index == -1) {
      return false;
    } else {
      this.queueLength--;
      _removeAt(index, this.queue, this.queueLength, this.comparator,
          this.equals);
      return true;
    }
  };

  /**
   * Returns whether or not the given object is in the queue or not.
   * @param {*} obj The object to find.
   * @return {boolean} True if the queue contains the object, false if
   * otherwise.
   */
  PriorityQueue.prototype.contains = function(obj) {
    return _indexOf(obj, this.queue, this.queueLength, this.equals) != -1;
  };

  /**
   * Returns the internal queue array. Argument representing true indicates
   * whether the returned array is a copy of the array, or the array is
   * returned by reference.
   * @return {Array} (Possibly a copy of) the internal queue array.
   */
  PriorityQueue.prototype.getData = function() {
    if (arguments.length > 0 && arguments[0]) {
      return this.queue;
    }
    return this.queue.slice();
  };

  /**
   * Sets the data for this queue. Will automatically convert to a complete
   * binary tree.
   * @param {Array} data The array which should be used for a PriorityQueue.
   * @param {number} size Optional, the size of the array. When not present,
   * will use the length of the array. This is be needed when the data to
   * set comes from another PriorityQueue.
   */
  PriorityQueue.prototype.setData = function(data, size) {
    var arr = [];
    if (data.forEach) {
      data.forEach(function(val) {
        arr.push(val);
      });
    } else {
      var val;
      for (val in data) {
        arr.push(data[val]);
      }
    }
    this.queue = arr;
    this.queueLength = size ? size : data.length;
    this.heapify();
  };

  /**
   * Returns the comparator used in this queue.
   * @return {function} The comparator used in this queue.
   */
  PriorityQueue.prototype.getComparator = function() {
    return this.comparator;
  };

  /**
   * Returns the equals function used in this queue.
   * @return {function} The equals function used in this queue.
   */
  PriorityQueue.prototype.getEquals = function() {
    return this.equals;
  };

  /**
   * Returns the amount of elements in the queue.
   * @return {number}
   */
  PriorityQueue.prototype.size = function() {
    return this.queueLength;
  };

  /**
   * Restores the queue to a complete binary tree.
   */
  PriorityQueue.prototype.heapify = function() {
    for (var i = ((this.queueLength / 2) | 0); i >= 0; i--) {
      _siftDown(i, this.queue[i], this.queue, this.queueLength,
          this.comparator);
    }
  };

  /**
   * Returns a copy of this queue.
   * @return {PriorityQueue} The clone.
   */
  PriorityQueue.prototype.clone = function() {
    return new net.jstege1206.PriorityQueue({
      comparator: this.comparator,
      equals: this.equals,
      data: this.queue.slice()
    });
  };

  /**
   * Restores the complete binary tree by sifting down the given object.
   * @param {Number} pos The position to start sifting down from.
   * @param {Array} queue The queue to use.
   * @param {number} queueLength The length of the queue.
   * @param {function} comparator The comparator to use.
   * @param {*} obj The object to sift down.
   * @private
   */
  function _siftDown(pos, obj, queue, queueLength, comparator) {
    var half = (queueLength / 2) | 0;
    while (pos < half) {
      var lChild = pos * 2 + 1;
      var childObj = queue[lChild];
      var rChild = lChild + 1;
      if (rChild < queueLength && comparator(childObj, queue[rChild]) > 0) {
        lChild = rChild;
        childObj = queue[lChild];
      }
      if (comparator(obj, childObj) <= 0) {
        break;
      }
      queue[pos] = childObj;
      pos = lChild;
    }
    queue[pos] = obj;
  }

  /**
   * Restores the complete binary tree by sifting up the given object.
   * @param {Number} pos The position to start sifting up from.
   * @param {*} obj The object to sift up.
   * @param {Array} queue The queue to use.
   * @param {function} comparator The comparator to use.
   * @private
   */
  function _siftUp(pos, obj, queue, comparator) {
    while (pos > 0) {
      var parent = ((pos - 1) / 2) | 0;
      var c = queue[parent];
      if (comparator(obj, c) >= 0) {
        break;
      }
      queue[pos] = c;
      pos = parent;
    }
    queue[pos] = obj;
  }

  /**
   * Remove an element at the given position. Will restore the complete binary
   * tree after removing the element.
   * @param {number} pos The position from which to remove the element.
   * @param {Array} queue The queue to use.
   * @param {number} queueLength The length of the queue.
   * @param {function} comparator The comparator to use.
   * @param {function} equals The equals function to use.
   * @private
   */
  function _removeAt(pos, queue, queueLength, comparator, equals) {
    if (queueLength == pos) {
      delete queue[queueLength];
    } else {
      var moved = queue[queueLength];
      queue[queueLength] = null;
      _siftDown(pos, moved, queue, queueLength, comparator);
      if (equals(queue[pos], moved)) {
        _siftUp(pos, moved, queue, comparator);
      }
    }
  }

  /**
   * Returns the position of the given object in the queue.
   * @param {*} obj The object to find.
   * @param {Array} queue The queue to search.
   * @param {number} queueLength Length of the queue.
   * @param {function} equals The equals function to use.
   * @return {number} The position in the queue the element is at, -1 if
   * not found.
   * @private
   */
  function _indexOf(obj, queue, queueLength, equals) {
    if (obj != null) {
      for (var i = 0; i < queueLength; i++) {
        if (equals(obj, queue[i])) {
          return i;
        }
      }
    }
    return -1;
  }

  net.jstege1206.PriorityQueue = PriorityQueue;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  /**
   * Exports PriorityQueue to nodejs
   * @type {PriorityQueue}
   */
  module.exports = exports = PriorityQueue = net.jstege1206.PriorityQueue;
}
