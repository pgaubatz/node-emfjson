'use strict';

var expect = require('chai').expect;

var Serializer = require('../lib/serializer');

describe('EMFJson Serializer', function () {

  it('serializes "/" references', function () {
    var obj = {
        'id': 1
      },
      json,
      result;

    obj.ref = obj;

    json = Serializer.stringify(obj);
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

    json = Serializer.stringify(model);
    result = JSON.parse(json);

    expect(result.role[0].owner[0]['$ref']).to.equal('//@subject.0');
    expect(result.role[0].owner[1]['$ref']).to.equal('//@subject.1');
  });

});
