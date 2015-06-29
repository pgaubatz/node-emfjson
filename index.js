'use strict';

var Deserializer = require('./lib/deserializer');
var Serializer = require('./lib/serializer');

module.exports = {
  dereference: Deserializer.dereference,
  parse: Deserializer.dereference,
  stringify: Serializer.stringify
};
