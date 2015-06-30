'use strict';

var expect = require('chai').expect;

var Deserializer = require('../lib/deserializer');

describe('EMFJson Deserializer', function () {

  it('resolves "/" references', function () {
    var obj = {
        'id': 1,
        'model': {
          '$ref': '/',
          'eClass': 'foo'
        }
      },
      result = Deserializer.dereference(obj);

    expect(result.model.id).to.equal(obj.id);
  });

  it('resolves "//property.num" references', function () {
    var obj = {
        'arr': [
          {'id': 0},
          {'id': 1},
          {'id': 2}
        ],
        'model': {
          '$ref': '//@arr.2',
          'eClass': 'foo'
        }
      },
      result = Deserializer.dereference(obj);

    expect(result.model).to.deep.equal(obj.arr[2]);
  });

  it('resolves "//property1.num1/property2.num2" references', function () {
    var obj = {
        'arr1': [
          {
            'id1': 0,
            'arr2': [
              {'id2': 0},
              {'id2': 1}
            ]
          },
          {
            'id1': 1,
            'arr2': [
              {'id2': 0},
              {'id2': 1}
            ]
          }
        ],
        'model': {
          '$ref': '//@arr1.1/@arr2.0',
          'eClass': 'foo'
        }
      },
      result = Deserializer.dereference(obj);

    expect(result.model).to.deep.equal(obj.arr1[1].arr2[0]);
  });

});
