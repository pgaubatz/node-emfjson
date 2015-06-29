'use strict';

var _ = require('lodash');

var Serializer = {
  attr: '__emfJsonPath',

  discoverObjects: function (obj, currentPath) {
    var child,
      children = [];

    obj[Serializer.attr] = currentPath;

    _.keys(obj).forEach(function (key) {
      child = obj[key];

      if (_.isObject(child)) {
        if (!_.has(child, Serializer.attr)) {
          child[Serializer.attr] = currentPath + (_.isArray(obj) ? '.' : '/@') + key;
          children.push(child);
        } else {
          obj[key] = {
            '$ref': child[Serializer.attr]
          };
        }
      }
    });

    _.each(children, function (child) {
      Serializer.discoverObjects(child, child[Serializer.attr], obj);
    });
  },

  stringify: function (obj) {
    var clone = _.cloneDeep(obj);

    Serializer.discoverObjects(clone, '/', clone);

    return JSON.stringify(clone, function (key, value) {
      return (key === Serializer.attr) ? undefined : value;
    });
  }
};

module.exports = Serializer;
