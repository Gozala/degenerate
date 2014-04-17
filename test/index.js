var test = require("tape")
var Generator = require("../")

new function() {
  "use strict";

  test("simple test", function(test) {
    var range = Generator(function(from, to, step) {
      step = step || 1
      var n = from

      while (n <= to) {
        this.yield(n)
        n ++
      }

      return n;
    })

    var digits = range(0, 9)
    var step = void(0)
    var results = []
    while (step = digits.next(), !step.done) {
      results.push(step.value)
    }

    test.deepEqual(results, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                   "generator stepped through each item")
    test.end()
  })

  test("yield into", function(test) {
    var gen = Generator(function() {
      return this.yield(1) + 1
    })

    test.equal(typeof(gen), "function", "generator is function")
    test.ok(gen.isGenerator(), "isGenerator() is true")

    var task = gen()

    test.equal(typeof(task.next), "function", ".next is a method")
    test.equal(typeof(task.throw), "function", ".throw is a method")

    var step = task.next()

    test.equal(step.done, false, "task isn't complete")
    test.equal(step.value, 1, "value yield is 1")

    step = task.next(10)

    test.equal(step.done, true, "task is complete")
    test.equal(step.value, 11, "value yield is 11")

    test.end()
  })

  test("yield into", function(test) {
    var gen = Generator(function() {
      return this.yield(1) + 1
    })

    test.equal(typeof(gen), "function", "generator is function")
    test.ok(gen.isGenerator(), "isGenerator() is true")

    var task = gen()

    test.equal(typeof(task.next), "function", ".next is a method")
    test.equal(typeof(task.throw), "function", ".throw is a method")

    var step = task.next()

    test.equal(step.done, false, "task isn't complete")
    test.equal(step.value, 1, "value yield is 1")

    step = task.next(step.value * 10)

    test.equal(step.done, true, "task is complete")
    test.equal(step.value, 11, "value yield is 11")

    test.end()
  })

  test("throw into", function(test) {
    var gen = Generator(function() {
      try {
        this.yield(1)
      } catch(error) {
        return error
      }
    })

    var boom = new Error("Boom")
    var task = gen()

    var step = task.next()

    test.equal(step.done, false, "task isn't complete")
    test.equal(step.value, 1, "value yield is 1")

    step = task.throw(boom)

    test.equal(step.done, true, "task is complete")
    test.equal(step.value, boom, "value yield is an error")

    test.end()
  })

  test("throw out", function(test) {
    var gen = Generator(function() {
      this.yield(1)
      throw new Error("Boom")
    })

    var task = gen()
    var step = task.next()

    test.equal(step.done, false, "task isn't complete")
    test.equal(step.value, 1, "value yield is 1")

    test.throws(function() {
      task.throw(boom)
    }, "Boom", "exception thrown out")

    test.end()
  })

  test("yield sequence", function(test) {
    var gen = Generator(function() {
      var x = 1
      this.yield(x++, x+2, 3)
      this.yield(x)
    })
    var task = gen()
    var step = task.next()

    test.equal(step.value, 3, "yields last item in sequnce")

    step = task.next()

    test.equal(step.value, 2, "side effects still happen")
    test.end()
  })


  test("errors on non function", function(test) {
    test.throws(function() {
      Generator(5)
    }, "Argument must be a function")
    test.end()
  })

  test("delegate generator", function(test) {
    var concat = new Generator(function(xs, ys) {
      this.yield* xs
      this.yield* ys
    })

    var range = Generator(function(from, to) {
      var n = from

      while (n <= to) {
        this.yield(n)
        n ++
      }
    })

    var zs = concat(range(1, 2), range(3, 4))
    var step = void(0)
    var items = []

    while (step = zs.next(), !step.done) {
      items.push(step.value)
    }

    test.deepEqual(items, [1, 2, 3, 4], "delegate yield worked")

    test.end()
  })
}

new function() {
  "no strict";

  test("yield without this", function(test) {


    var gen = Generator(function() {
      return yield(1) + 1
    })

    test.equal(typeof(gen), "function", "generator is function")
    test.ok(gen.isGenerator(), "isGenerator() is true")

    var task = gen()

    test.equal(typeof(task.next), "function", ".next is a method")
    test.equal(typeof(task.throw), "function", ".throw is a method")

    var step = task.next()

    test.equal(step.done, false, "task isn't complete")
    test.equal(step.value, 1, "value yield is 1")

    step = task.next(10)

    test.equal(step.done, true, "task is complete")
    test.equal(step.value, 11, "value yield is 11")

    test.end()
  })

  test("delegate without this", function(test) {
    var concat = new Generator(function(xs, ys) {
      yield* xs
      yield* ys
    })

    var range = Generator(function(from, to) {
      var n = from

      while (n <= to) {
        yield(n)
        n ++
      }
    })

    var zs = concat(range(1, 2), range(3, 4))
    var step = void(0)
    var items = []

    while (step = zs.next(), !step.done) {
      items.push(step.value)
    }

    test.deepEqual(items, [1, 2, 3, 4], "delegate yield worked")

    test.end()
  })
}
