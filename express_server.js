const express = require("express");
const app = express();
const PORT = 8080;


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  let result = [];
  let charas = "abcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0 ; i < 6; i++) {
    let rand = Math.floor(Math.random() * (charas.length - 1) + 1);
    result.push(charas[rand]);
  }
  return result.join('');
}

const urlDatabase = {
  "b2xVn2" : "http://www.lighthouselabs.ca",
  "9sm5xK" : "http://www.google.com"
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
  const templateVars = {urls:urlDatabase};
  res.render("urls_index",templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Create new short url after receiving it from the new url page.
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let newID = generateRandomString()
  urlDatabase[newID] = req.body.longURL;
  console.log(urlDatabase);
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`urls/${newID}`);
});

//User only receives the page for specific url, is linked from the edit file
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id",(req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Directs from url page's delete button, deletes entry
app.post("/urls/:id/delete",(req, res) => {
  const urlId = req.params.id;
  delete urlDatabase[urlId];
  res.redirect("/urls");

})

//update urls after receiving Submit from the show url page.
app.post("/urls/:id", (req, res) => {
  console.log("req body is ",req.body, "req parameter is ", req.params);
  //console.log(req.params);
  console.log(urlDatabase);
  urlDatabase[req.params.id] = req.body.longURL;
  console.log(urlDatabase);

  res.redirect("/urls");
});

//Directs from the login button, creates value for username
app.post("/login",(req,res) => {
  console.log(req.body.username);
  res.cookie("user",req.body.username);
  res.redirect("/urls");
})

app.listen(PORT, ()=> {
  console.log(`Example app listening on port ${PORT}!`);

});