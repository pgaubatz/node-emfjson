'use strict';

var expect = require('chai').expect;

var EMFJson = require('../emfjson');

describe('EMFJson', function () {
  it('resolves "/" references', function () {
    var obj = {
        'id': 1,
        'model': {
          '$ref': '/',
          'eClass': 'foo'
        }
      },
      result = EMFJson.dereference(obj);

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
      result = EMFJson.dereference(obj);

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
      result = EMFJson.dereference(obj);

    expect(result.model).to.deep.equal(obj.arr1[1].arr2[0]);
  });

  it('serializes "/" references', function () {
    var obj = {
        'id': 1,
      },
      json,
      result;

    obj.ref = obj;

    json = EMFJson.stringify(obj);
    result = JSON.parse(json);

    expect(result.ref['$ref']).to.equal('/');
  });

  it('serializes "//property.num" references', function () {
    var model = {
        subject: [
          {name: 's0'},
          {name: 's1'},
          {name: 's2'}
        ],
        role: [
          {name: 'r0'},
          {name: 'r1'}
        ]
      },
      json,
      result;

    model.role[0].owner = [model.subject[0], model.subject[1]];

    json = EMFJson.stringify(model);
    result = JSON.parse(json);

    expect(result.role[0].owner[0]['$ref']).to.equal('//@subject.0');
    expect(result.role[0].owner[1]['$ref']).to.equal('//@subject.1');
  });

  // it('resolves "//property1.num1/property2.num2" references', function () {
  // 	var obj = {
  // 			'arr1': [
  // 				{
  // 					'id1': 0,
  // 					'arr2': [
  // 						{ 'id2': 0 },
  // 						{ 'id2': 1 }
  // 					]
  // 				},
  // 				{
  // 					'id1': 1,
  // 					'arr2': [
  // 						{ 'id2': 0 },
  // 						{ 'id2': 1 }
  // 					]
  // 				}
  // 			],
  // 			'model': {
  // 				'$ref' : '//@arr1.1/@arr2.0',
  // 				'eClass' : 'foo'
  // 			}
  // 		},
  // 		result = EMFJson.dereference(obj);

  // 	console.log(result);

  // 	expect(result.model).to.deep.equal(obj.arr1[1].arr2[0]);
  // });
});
