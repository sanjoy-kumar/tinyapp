const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')




const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// ----------------------------Helper Functions -------------------------

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  while (randomString.length < 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }

  return randomString;
};





// ------------------- Add GET Route ----------------------------------------

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Login page that allows users to sign into their account

app.get('/login', (req, res) => {
  res.status(200).render('urls_login');
});



// ------------------ Add POST Route --------------------------------

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


// Deleting URLs

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


// Edit URLs

app.post('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  const longUrl = req.body.longURL;

  urlDatabase[shortUrl] = longUrl;  
  res.redirect('/urls');
});

// login

app.post('/login', (req, res) => {
  

    if (verifiedUser) {

      req.session.userid = verifiedUser;
      res.status(301).redirect('/urls');
    } else {
      req.flash('error', 'Username and Password do not match. Please try again.')
      res.status(301).redirect('/login')
    }
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

