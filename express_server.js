const express = require("express");
const morgan = require('morgan');
const cookieSession = require("cookie-session");
const { urlDatabase, users } = require('./db');
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helper');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));
app.use(morgan('tiny'));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let loggedUserID = req.session.user_id;

  if (!loggedUserID) {
    return res.send('<html><body><b>User needs to login <a href="/login">here</a></b></body></html>\n');

  }

  let templateVars = { urls: urlsForUser(loggedUserID, urlDatabase), user_id: loggedUserID, userslist: users };
  res.render("urls_index", templateVars);


});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.render("urls_new");
});

app.get("/register", (req, res) => {
  
  if ('user_id' in req.session) {
    return res.redirect("/urls");
  }
  res.render("user_register");

});

//NEW USER GENERATOR*****/
//Redirects from createuser submit button, creates new user
app.post("/register", (req, res) => {
  
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Empty Input, Discontinued registration");
  }
  if (getUserByEmail(req.body.email, users) !== null) {
    return res.status(400).send("Email already exists").redirect("/urls");
  }

  let newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };

  req.session.user_id = newID;
  res.redirect("/urls");
});

//NEW URL GENERATION *////
//Create new short url after receiving it from the new url page.
app.post("/urls", (req, res) => {
  let loggedUserID = req.session.user_id;
  if (!loggedUserID) {
    res.send("Please login to shorten url");
  }

  let newShort = generateRandomString();

  let input = { longURL: req.body.longURL, userID: loggedUserID };
  urlDatabase[newShort] = input;

  res.redirect(`urls/${newShort}`);
});

//User only receives the page for specific url, is linked from the edit file
app.get("/urls/:id", (req, res) => {
  const url = req.params.id;
  let loggedUserID = req.session.user_id;
  if (url in urlDatabase === false) {
    return res.send("Short url does not exists");
  }

  if (!loggedUserID) {
    return res.send("Please login to access your specific url");
  }
  
  if (urlDatabase[url].userID !== loggedUserID) {
    return res.send("You do not own this url");
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[url].longURL, user_id: loggedUserID, userslist: users };
  res.render("urls_show", templateVars);
});

//Short Url redirects to the original website
app.get("/u/:id", (req, res) => {

  const urlID = req.params.id;
  //tried to !req.params.id in urlDatabase) didnt work.
  if (!Object.keys(urlDatabase).includes(urlID)) {
    res.send(`${req.params.id} Short url does not exists`);
  }

  const longURL = urlDatabase[urlID].longURL;
  res.redirect(longURL);
});

// Directs from url page's delete button, deletes entry
app.post("/urls/:id/delete", (req, res) => {
  let loggedUserID = req.session.user_id;
  const urlID = req.params.id;

  if (!loggedUserID) {
    return res.send("user is not logged in");
  }

  if (!(Object.keys(urlDatabase).includes(urlID))) {
    return res.send(`${urlID} short url does not exists!`);
  }

  if (!(urlID in urlsForUser(loggedUserID, urlDatabase))) {
    return res.send("User does not own the short url");
  }

  delete urlDatabase[urlID];
  res.redirect("/urls");

});

//update urls after receiving Submit from the show url page.
app.post("/urls/:id", (req, res) => {

  let url = req.params.id;
  let loggedUserID = req.session.user_id;
  if (!req.session.user_id) {
    return res.send("user is not logged in");
  }
  

  if (!(url in urlsForUser(loggedUserID, users))) {
    return res.send("User does not own the short url");
  }
  // //checks if the short url exists and if the user own them.
  if (!Object.keys(urlDatabase).includes(url)) {
    return res.send(`${req.params.id} short url does not exists!`);
  }


  urlDatabase[url].longURL = req.body.longURL;
  console.log(urlDatabase);
  res.redirect("/urls");
});


//Directed from header login button.
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, userslist: users };

  let loggedUserID = req.session.user_id;
  console.log("value of logg",loggedUserID);
  //If user is already logged in
  if (req.session.user_id) {
    console.log("logged in");
    return res.redirect("/urls");
  }

  templateVars = { urls: urlsForUser(loggedUserID, urlDatabase), user_id: req.session.user_id, userslist: users };
  res.render("user_login", templateVars);
  
});



//Directs from the login button, creates value for user_id and establishes a session
app.post("/login", (req, res) => {

  let inputPass = req.body.password;
  let checkUser = users[getUserByEmail(req.body.email, users)];
  //let checkUser = getUserByEmail(req.body.email, users);

  if (!checkUser || !inputPass) {
    return res.status(403).send("No input given for either email or password");
  }


  if (checkUser === null) {
    return res.status(403).send("The following email is not registered");
  }
  
  if (checkUser !== null && !bcrypt.compareSync(inputPass, checkUser.password)) {
    return res.status(403).send("Invalid login");
  }

  req.session.user_id = checkUser.id;
  console.log(req.session);
  res.redirect("/urls");


});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});