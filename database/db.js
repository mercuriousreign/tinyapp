const bcrypt = require("bcryptjs");
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


const users = {
  userRandomID: {
    id: "userrandomid",
    email: "user@email.com",
    password: "remotebranch"
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "sam@jetstream",
    password: bcrypt.hashSync("pie", 10)
  }
};

module.exports = { urlDatabase, users };