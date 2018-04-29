/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 * 1 = email and password
 * 2 = facebook
 */

module.exports = {

  attributes: {
    username: {
      type: 'string',
      required: true,
      unique: true
    },
    password: {
      type: 'string',
    },
    type: {
      type: 'string'
    },
    tokens: {
      type: 'array'
    },
    profile: {
      model: 'profile',
    }
  }
};

