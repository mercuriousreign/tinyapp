const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// const urlDatabase = {
//   "b2xVn2" : "http://www.lighthouselabs.ca",
//   "9sm5xK" : "http://www.google.com"
// }

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
  userRandomID : {
    id:"userrandomid",
    email:"user@email.com",
    password:"remotebranch"},
    aJ48lW : {
      id: "aJ48lW",
      email : "sam@jetstream",
      password : "memories"
    }
}

function getUserByEmail(checkEmail){
  for (let usr in users) {
    if (users[usr].email === checkEmail) {
      return users[usr];
    }
  }
  return null;
}


function generateRandomString() {
  let result = [];
  let charas = "abcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0 ; i < 6; i++) {
    let rand = Math.floor(Math.random() * (charas.length - 1) + 1);
    result.push(charas[rand]);
  }
  return result.join('');
}

function urlsForUser(id) {
  let result = []
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result.join(url);
    }
  }
  return result;
}

app.get("/", (req,res) => {
  res.send("Hello!");
});

app.get("/urls.json",(req,res)=> {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req,res)=> {
  let templateVars = {urls:urlDatabase,userslist : users};
  console.log(req.cookies);
  if ('user_id' in req.cookies) {
    console.log("user_id found");
    templateVars = {urls:urlDatabase, user_id : req.cookies["user_id"], userslist : users};
    res.render("urls_index",templateVars);
  } else {
    res.send("<html><body><b>User is not logged in</b></body></html>\n");
    //res.render("urls_index",templateVars);
  }
  
});

app.get("/urls/new", (req, res) => {
  if (!'user_id'in req.cookies) {
    res.redirect("/login");
  }
  res.render("urls_new");
});

app.get("/register",(req,res) =>{
  if ('user_id' in req.cookies) {
    return res.redirect("/urls");
  } else {
    res.render("create_user")
  }
  
})

//Redirects from createuser submit button, creates new user
app.post("/register",(req,res) => {
  console.log(req.body);
  //userDatabase[userDatabase.length] = {useremail : req.body.useremail , password : req.body.password}
  //if inputs are empty
  if (req.body.email === "" || req.body.password === ""){
    return res.status(400).send("Empty Input, Discontinued registration");
  }
  if (getUserByEmail(req.body.email) !== null) {
    return res.status(400).send("Email already exists").redirect("/urls");
  }

  let newID = generateRandomString();
  users[newID] = {
    id: newID, 
    email : req.body.email,
    password : req.body.password
  }
    //console.log(users);
    //New registered person is logged in?
    res.cookie("user_id", newID);
    res.redirect("/urls")
})

//Create new short url after receiving it from the new url page.
app.post("/urls", (req, res) => {
  if (!'user_id' in req.cookies) {
    res.send("Please login to shorten url");
  }
  console.log(req.body); // Log the POST request body to the console
  let newShort = generateRandomString()
  //urlDatabase[newShort] = req.body.longURL;
  let input = { longURL : req.body.longURL , userID : req.cookies("user_id")};
  urlDatabase[newShort] = input
  console.log(urlDatabase);
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`urls/${newShort}`);
});

//User only receives the page for specific url, is linked from the edit file
app.get("/urls/:id", (req, res) => {

  if (!'user_id' in req.cookies) {
    return res.send("Please loggin to access your specific url");
  }
  let loggedUserID = req.cookies["user_id"];

  if (urlDatabase[req.params.id].userID !== loggedUserID) {
    return res.send("You do not own this url");
  } 
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user_id: loggedUserID , userslist : users };
  res.render("urls_show", templateVars);
});

app.get("/u/:id",(req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.id)){
    res.send(`${req.params.id} does not exists`);
  }
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Directs from url page's delete button, deletes entry
app.post("/urls/:id/delete",(req, res) => {
  if (!'user_id' in req.cookies) {
    return res.send("user is not logged in");
  }
  //checks if the short url exists and if the user own them.
  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.send(`${req.params.id} short url does not exists!`)
  }
  if (!urlsForUser(req.cookies['user_id'].includes(req.params.id))) {
    return res.send("User does not own the short url");
  }
  const urlId = req.params.id;
  delete urlDatabase[urlId];
  res.redirect("/urls");

})

//update urls after receiving Submit from the show url page.
app.post("/urls/:id", (req, res) => {
  console.log("req body is ",req.body, "req parameter is ", req.params);
  //console.log(req.params);
  if (!'user_id' in req.cookies) {
    return res.send("user is not logged in");
  }
  //checks if the short url exists and if the user own them.
  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.send(`${req.params.id} short url does not exists!`)
  }
  if (!urlsForUser(req.cookies['user_id'].includes(req.params.id))) {
    return res.send("User does not own the short url");
  }
  


  //console.log(urlDatabase);
  urlDatabase[req.params.id] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect("/urls");
});


//Directed from header login button.
app.get("/login", (req,res)=> {
  let templateVars = {urls:urlDatabase,userslist : users};
  console.log(req.cookies);
  if ('user_id' in req.cookies) {
    console.log("user_id found");
    templateVars = {urls:urlDatabase, user_id : req.cookies["user_id"], userslist : users};
    res.render("user_login",templateVars);
    res.redirect("/urls");
  } else {
    res.render("user_login",templateVars);
  }
});



//Directs from the login button, creates value for user_id (before it was username)
app.post("/login",(req,res) => {
  //console.log(req.body.username);
  // for (let usr in users) {
  //   if (users[usr].useremail === checkUser && users[usr].password === checkPass) {
  //     console.log("not get error")

  //   }
  let checkUser = getUserByEmail(req.body.email)
  
  console.log("user info is",checkUser)
  if (checkUser === null){
    return res.status(403).send("The following email is not registered");
  } 
  let checkPass = req.body.password
  console.log("pass info is ",checkPass);
  if (checkUser !== null && checkUser.password !== checkPass) {
    return res.status(403).send("Password does not match");
  }
    res.cookie("user_id",checkUser.id);
    res.redirect("/urls");


  // console.log("get error")
  // return res.status("error").redirect("/urls");
  
})

app.post("/logout",(req,res) => {
  //console.log("logoutbody is",req.params);
  res.clearCookie("user_id");
  res.redirect("/login");
})

app.listen(PORT, ()=> {
  console.log(`Example app listening on port ${PORT}!`);

});