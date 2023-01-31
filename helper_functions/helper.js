
//Helper function that allows generation of id , fetch of user by email and fetch of urls owned by the user
const getUserByEmail = function(checkEmail,users){
  for (let usr in users) {
    if (users[usr].email === checkEmail) {
      return usr;
    }
  }
  return null;
}


const generateRandomString = function () {
  let result = [];
  let charas = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0 ; i < 6; i++) {
    let rand = Math.floor(Math.random() * (charas.length - 1) + 1);
    result.push(charas[rand]);
  }
  return result.join('');
}

const urlsForUser = function (id,urlDatabase) {
  let result = {}
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url]
    }
  }
  return result;
}

module.exports = {getUserByEmail,generateRandomString,urlsForUser}