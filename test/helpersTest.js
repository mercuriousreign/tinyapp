const { assert, Assertion } = require('chai');

const { getUserByEmail } = require('../helper_functions/helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user,expectedUserID);
  });
  it('should return null when user doesnt exist', function () {
    const user = getUserByEmail("nouser@example.com", testUsers)
    const expectedUserID = null;
    assert.strictEqual(user,expectedUserID);
  });
});
