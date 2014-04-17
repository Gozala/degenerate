# degenerator

[![Build Status](https://secure.travis-ci.org/Gozala/degenerator.svg)](http://travis-ci.org/Gozala/degenerator)

[![Browser support](https://ci.testling.com/Gozala/degenerator.png)](http://ci.testling.com/Gozala/degenerator)


Library lets you create [ES6 generators][generators] with in the (dis)comfort of ES5 JS environment (like < node@0.11.x) and without syntax sugar. This magic happens at the cost of the syntax transformations at the generator instantiation. You can use this with [task.js][], [co][], [suspend][] or any other Generator-based flow control based library without waiting on your favorite JS environment to enable generators for you!

## API

Given a generators support in your environment you should be able to write code like this:

```js
var range = function*(from, to, step) {
  step = step || 1
  var n = from

  while (n <= to) {
    yield n
    n ++
  }

  return n
}

var digits = range(0, 9)
var step
while (step = digits.next(), !step.done) {
  console.log(step.value)
}
```

Unfortunately above code will throw a syntax error in engines that don't have generators support.

With a degenerator you can create equivalent range generator by typeing this:

```js
var Generator = require("degenerator")
var range = new Generator(function(from, to, step) {
  step = step || 1
  var n = from

  while (n <= to) {
    yield(n)
    n ++
  }

  return n
})

var digits = range(0, 9)
var step
while (step = digits.next(), !step.done) {
  console.log(step.value)
}
```

Notice the difference ? Just loose a `*` and replace `yield n` statement with `yield(n)` call expression.

You can also use delegeting yields:


```js
var concat = new Generator(function(xs, ys) {
  yield* xs
  yield* ys
})

var zs = concat(range(1, 3), range(4, 7))
while (step = zs.next(), !step.done) {
  console.log(step.value)
}
```

## Limitations

#### yield isn't a function

Don't try to outsmart this tool, even though `yield` may feel like a first class function, it is not and any attempts to use it as such will break the code.

#### strict mode is strict about yield

If you try to define function that refers to `yield` in strict mode, you'll get a syntax error :( To overcome this limitation all you need to do is write `this.yield` instead:

```js
"use strict";

var range = Generator(function(from, to) {
  while (from <= to)
    this.yield(from++)
})

var concat = new Generator(function(xs, ys) {
  this.yield* xs
  this.yield* ys
})
```

#### Enclosed variables are lost

This is the most unfortunate limitation of all! You can not enclose any scope variables, all that generator body will have has access to is a top scope or whatever has being passed into as `this` pseudo variable or as arguments.

## What's the trick ?

`Generator` function parses source of the given function, transforms AST to make function expression a generator, replace `yield(x)`, `this.yield(x)` with `yield x`. Transforms new AST via [facebook/regenerator][] (Thank them for making it possible) and finally generates a generator from the results.


## Install

    npm install degenerator


[generators]:http://wiki.ecmascript.org/doku.php?id=harmony:generators
[task.js]:http://taskjs.org/
[co]:https://github.com/visionmedia/co
[suspend]:https://github.com/jmar777/suspend
[facebook/regenerator]:http://facebook.github.io/regenerator/
