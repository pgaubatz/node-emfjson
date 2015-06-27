'use strict';

var _ = require('lodash');

var Deserializer = {
  resolveRef: function (ref, root) {
    var currentEntity = root;

    if (ref === '/') {
      return root;
    }

    if (ref.substr(0, 3) !== '//@') {
      throw new Error('wrong $ref format... ' + ref);
    }

    ref = ref.slice(2); // strip '//'

    ref.split('/').forEach(function (t1) {
      t1 = t1.slice(1); // strip '@'

      t1.split('.').forEach(function (t2) {
        if (typeof currentEntity[t2] === 'undefined') {
          throw new Error('invalid $ref... ' + ref);
        }
        currentEntity = currentEntity[t2];
      });
    });

    return currentEntity;
  },

  visit: function (entity, root, parent, options) {
    if (Array.isArray(entity)) {
      Deserializer.visitArray(entity, root, options);
    } else if (typeof entity === 'object') {
      Deserializer.visitObject(entity, root, parent, options);
    }
  },

  visitObject: function (obj, root, parent, options) {
    var value, resolvedValue;

    Object.keys(obj).forEach(function (key) {
      value = obj[key];

      if (key === '$ref') {
        // sanity checks...
        // if (typeof parent.entity[parent.index] === 'undefined' ||
        // 	typeof obj.eClass === 'undefined' ||
        // 	typeof parent.index === 'undefined') {
        // 	throw 'ths should not happen...';
        // }

        resolvedValue = Deserializer.resolveRef(value, root);
        if (options.hasOwnProperty('serializeEClass')) {
          resolvedValue.eClass = obj.eClass; // copy eClass property
        }

        parent.entity[parent.index] = resolvedValue;
      }

      Deserializer.visit(value, root, {
        entity: obj,
        index: key
      }, options);
    });
  },

  visitArray: function (arr, root, options) {
    arr.forEach(function (element, index) {
      Deserializer.visit(element, root, {
        entity: arr,
        index: index
      }, options);
    });
  },

  dereference: function (json, options) {
    var obj;

    options = options || {};
    if (options.clone || typeof json === 'object') {
      json = JSON.stringify(json);
    }
    obj = JSON.parse(json, options.reviver);
    Deserializer.visit(obj, obj, obj, options);
    return obj;
  }
};

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

module.exports = {
  dereference: Deserializer.dereference,
  parse: Deserializer.dereference,
  stringify: Serializer.stringify
};
