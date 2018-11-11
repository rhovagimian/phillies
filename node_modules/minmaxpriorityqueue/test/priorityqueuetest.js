var vows = require('vows'), assert = require('assert'),
    PriorityQueue = require('../priorityqueue');

vows.describe('PriorityQueue').addBatch({
  'A priority queue sorts values so it': {
    topic: function() {
      var arr = [1, 3, 5, 4, 2, 6];
      var queue = new PriorityQueue();
      queue.setData(arr, arr.length);
      var arr2 = [];
      while (queue.size() > 0) {
        arr2.push(queue.poll());
      }
      return arr2;
    },
    'should return a sorted array when polled until empty': function(topic) {
      assert.deepEqual(topic, [1, 2, 3, 4, 5, 6]);
    }
  },
  'A priority queue supports custom comparators so it': {
    topic: function() {
      var createObject = function(val) {this.value = val;};
      var arr = [new createObject(1),
            new createObject(3),
            new createObject(5),
            new createObject(4),
            new createObject(2),
            new createObject(6)];
      var queue = new PriorityQueue({
        comparator: function(a, b) { return a.value - b.value }
      });
      queue.setData(arr, arr.length);

      var arr2 = [];
      while (queue.size() > 0) {
        arr2.push(queue.poll());
      }
      return arr2;
    },
    'should return a sorted array with arbitrary objects': function(topic) {
      var createObject = function(val) {this.value = val;};
      var arr = [new createObject(1),
            new createObject(2),
            new createObject(3),
            new createObject(4),
            new createObject(5),
            new createObject(6)];
      assert.deepEqual(topic, arr);
    }
  },
  'A priority queue can see if an element is present in the queue so it': {
    topic: function() {
      var queue = new PriorityQueue();
      queue.offer(1);
      queue.offer(3);
      return queue;
    },
    'should contain 1 and 3': function(topic) {
      assert.equal(topic.contains(1), true);
      assert.equal(topic.contains(3), true);
    },
    'should not contain 2': function(topic) {
      assert.equal(topic.contains(2), false);
    }
  },
  'A priority queue supports removing of elements anywhere so it': {
    topic: function() {
      var queue = new PriorityQueue();
      queue.offer(1);
      queue.offer(2);
      queue.offer(3);
      queue.remove(2);
      return queue;
    },
    'should contain 1 and 3': function(topic) {
      assert.equal(topic.contains(1), true);
      assert.equal(topic.contains(3), true);
    },
    'should not contain 2': function(topic) {
      assert.equal(topic.contains(2), false);
    }
  },
  'A priority queue should be empty after clearing so the length': {
    topic: function() {
      var queue = new PriorityQueue();
      queue.offer(1);
      queue.offer(2);
      queue.offer(3);
      queue.clear();
      return queue.size();
    },
    'should be equal to 0': function(topic) {
      assert.equal(topic, 0);
    }
  },
  'A priority queue can check the minimum element without side-effects so it': {
    topic: function() {
      var queue = new PriorityQueue();
      queue.offer(3);
      queue.offer(1);
      queue.offer(2);
      return queue;
    },
    'should return 1 when peeking': function(topic) {
      assert.equal(topic.peek(), 1);
    },
    'should still have size 3 after peeking.': function(topic) {
      topic.peek();
      assert.equal(topic.size(), 3);
    }
  },
  'A priority queue should copy itself by value when cloning so it': {
    topic: function() {
      var queue = new PriorityQueue();
      queue.offer(1);
      var queue2 = queue.clone();
      queue2.offer(2);
      return queue.getData(true) == queue2.getData(true);
    },
    'should not have the same internal array': function(topic) {
      assert.equal(topic, false);
    }
  }
}).run();
