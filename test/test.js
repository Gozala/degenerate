var tape = require("tape")

module.exports = function(description, unit) {
  tape(description, function(test) {
    unit(test)
  })
}
