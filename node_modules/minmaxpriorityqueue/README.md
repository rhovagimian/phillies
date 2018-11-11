# PriorityQueue
PriorityQueue is a Javascript implementation of a min/max PriorityQueue.

## Recent changes
### V1.0
In version 1.0 support for setComparator(func) and setEquals(func) is removed. These methods
resulted in unsuspected behaviour. When these functions are needed, please revert to version
[0.9.2](https://github.com/JStege1206/PriorityQueue/tree/e1d7fbb667dc97608dd6f71f3d9f73781e2b2088).
## Documentation
### Constructor
```javascript
var queue = new PriorityQueue(options)
```
The constructor checks if the given options object contains one of the following fields:
* comparator:
  **function** The comparator to use when comparing elements in the queue. This is used for
  sorting the queue. When adding elements which can not be easily compared, supply a comparator
  which is able to compare the given object. Not using a right comparator will result in
  undefined behaviour, possibly not giving the right results. Remember to take null or undefined
  values into account. Default comparator is as follows:
```javascript
function compare(a, b) {
    if (typeof a == 'undefined' || a == null) {
        return 1;
    }
    if (typeof b == 'undefined' || b == null) {
        return -1;
    }
    return a - b;
}
```
* data:
  **iterable** The initial dataset to use to create a priority queue from. Accepts objects which
  support a forEach function or are iterable through a for/in loop.
* equals:
  **function** The equals function to use. This is used for checking whether or not an element is
  in the queue. By default, equals will check if 2 values are equal by a simple `a == b` check.
  If this is not enough, write your own equals function.

### Methods
* `clear()`:
  Clears the complete queue, removing all elements, restoring the internal queue to an empty array.
* `peek()`:
  Returns the first element in the queue (nb. The 'least' element) without removing it from the
  head of the queue.
* `poll()`:
  Returns the first element in the queue (nb. The 'least' element) and removes it from the head
  of the queue. The queue will then return to a complete binary tree.
* `offer(obj)`:
  Adds the given `obj` to the queue, at it's rightful position.
* `remove(obj)`:
  Removes the given `obj` from the queue, when present. After removal it will return to a
  complete binary tree.
* `contains(obj)`:
  Checks if the given `obj` is present in the queue.
* `getData()`:
  Returns a copy of the internal queue array. Mostly usable for debugging purposes. When
  given an argument representing true, the returned array is passed by reference. This
  argument is optional. Note that this will not return a sorted array, it will return the
  internal representation of the queue.
* `setData(data)`:
  Sets the data of the queue. Will return to a complete binary tree after adding.
* `size()`:
  Returns the amount of objects in the queue, is not equal to getArray().length. The internal
  array might be a lot longer when objects are polled/removed from the queue.
* `clone()`:
  Copies the queue by value into a new PriorityQueue object with the same values as the original
  queue.
* `setComparator(func)` *REMOVED IN V1.0*:
  Sets the comparator to be used.
* `getComparator()`:
  Returns the comparator used.
* `setEquals(func)` *REMOVED IN V1.0*:
  Sets the equals function to be used.
* `getEquals()`
  Returns the equals function used.

## Installation
Installing this package is easily done. You can use one of the following options:
* NPM: This package is available in the NPM repository, you can install it by running the
following command:
```
npm install minmaxpriorityqueue
```
* Downloading a ZIP file containing the sources from
[this link](https://github.com/JStege1206/PriorityQueue/archive/master.zip).
* Cloning the GIT repository by cloning [this link](git@github.com:JStege1206/PriorityQueue.git)

## License
This code is released under the MIT license. Do what you want with it, just leave the copyright
notice present as is required by MIT.