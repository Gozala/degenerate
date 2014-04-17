"use strict";

var regenerator = require("regenerator")
var wrapGenerator = require("regenerator/runtime/dev").wrapGenerator
var recast = require("regenerator/node_modules/recast")
var esprima = require("regenerator/node_modules/esprima")
var Syntax = recast.Syntax


function toSource(f) {
  if (typeof(f) !== "function")
    throw new TypeError("Argument must be a function")
  return "(" + Function.toString.call(f) + ")"
}

function isYieldMember(node) {
  return node.type === Syntax.MemberExpression &&
         node.property.name === "yield" &&
         node.object.type === Syntax.ThisExpression
}

function isYieldIdentifier(node) {
  return node.type === Syntax.Identifier &&
         node.name === "yield"
}

function isYield(node) {
  return isYieldIdentifier(node) || isYieldMember(node)
}

function isYieldCall(node) {
  return node.type === Syntax.CallExpression &&
         isYield(node.callee)
}

function isYieldDelegate(node) {
  return node.type === Syntax.BinaryExpression &&
         node.operator === "*" &&
         isYield(node.left)
}

function merge(a, b) {
  var c = Object.create(Object.getPrototypeOf(a))
  var keys = Object.keys(a).concat(Object.keys(b))
  var index = 0
  while (index < keys.length) {
    var key = keys[index]
    c[key] = key in b ? b[key] : a[key]
    index = index + 1
  }
  return c
}

function yieldify(node) {
  return {
    type: Syntax.YieldExpression,
    delegate: false,
    argument: {
      type: Syntax.SequenceExpression,
      expressions: node.arguments
    }
  }
}

function yieldelegetify(node) {
  return {
    type: Syntax.YieldExpression,
    delegate: true,
    argument: node.right
  }
}
function generatorify(ast) {
  var program = ast.program
  var statement = program.body[0]
  var expression = statement.expression

  return merge(ast, {
    program: merge(program, {
      body: [merge(statement, {expression: merge(expression, {generator: true})})]
    })
  })
}


function swap(node, state) {
  for (var key in node) {
    delete node[key]
  }
  for (var key in state) {
    node[key] = state[key]
  }
}

function transform(ast) {
  return recast.types.traverse(generatorify(ast), function(node) {
    return isYieldCall(node) ? swap(node, yieldify(node)) :
           isYieldDelegate(node) ? swap(node, yieldelegetify(node)) :
           node
  })
}

function Generator(routine) {
  var es5 = recast.parse(toSource(routine), { esprima: esprima })
  var es6 = transform(es5)
  var ast = regenerator.transform(es6)
  var body = "return " + recast.print(ast).code
  var make = new Function("wrapGenerator", body)

  var generator = make(wrapGenerator)
  generator.isGenerator = function() {
    return true
  }
  return generator
}
module.exports = Generator
