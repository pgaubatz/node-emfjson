'use strict';

var clone = require('clone');

var MAGIC_KEY = '__emfJsonPath';

module.exports = {
  stringify: stringify
};

function stringify(obj) {
  var cloned = clone(obj);

  discoverObjects(cloned, '/', cloned);

  return JSON.stringify(cloned, function (key, value) {
    return (key === MAGIC_KEY) ? undefined : value;
  });
}

function discoverObjects(obj, currentPath) {
  var children = [];

  obj[MAGIC_KEY] = currentPath;

  Object.keys(obj).forEach(function (key) {
    var child = obj[key];

    if (typeof child === 'object') {
      if (!(MAGIC_KEY in child)) {
        child[MAGIC_KEY] = currentPath + (Array.isArray(obj) ? '.' : '/@') + key;
        children.push(child);
      } else {
        obj[key] = {
          '$ref': child[MAGIC_KEY]
        };
      }
    }
  });

  children.forEach(function (child) {
    discoverObjects(child, child[MAGIC_KEY], obj);
  });
}
