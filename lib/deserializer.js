'use strict';

module.exports = {
  dereference: dereference,
  deserialize: dereference
};

function dereference(json, options) {
  options = options || {};
  if ('clone' in options || typeof json === 'object') {
    json = JSON.stringify(json);
  }

  var obj = JSON.parse(json, options.reviver);
  visit(obj, obj, obj, options);
  return obj;
}

function visit(entity, root, parent, options) {
  if (Array.isArray(entity)) {
    visitArray(entity, root, options);
  } else if (typeof entity === 'object') {
    visitObject(entity, root, parent, options);
  }
}

function visitObject(obj, root, parent, options) {
  Object.keys(obj).forEach(function (key) {
    var value = obj[key];

    if (key === '$ref') {
      var resolvedValue = resolveRef(value, root);
      if ('serializeEClass' in options) {
        resolvedValue.eClass = obj.eClass; // copy eClass property
      }

      parent.entity[parent.index] = resolvedValue;
    }

    visit(value, root, {
      entity: obj,
      index: key
    }, options);
  });
}

function visitArray(arr, root, options) {
  arr.forEach(function (element, index) {
    visit(element, root, {
      entity: arr,
      index: index
    }, options);
  });
}

function resolveRef(ref, root) {
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
      if (!(t2 in currentEntity)) {
        throw new Error('invalid $ref... ' + ref);
      }
      currentEntity = currentEntity[t2];
    });
  });

  return currentEntity;
}
