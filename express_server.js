const express = require('express');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({name: 'session', secret: 'grey-rose-juggling-volcanoes'}));
app.set('view engine', 'ejs');


//------------------ variables-------------------------------------------------

const urlDatabase = {};
const users = {};


//-----------------  Helper functions Calling-----------------------------------

const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

//------------------------------------------------------------------------------
// ------------------- GET Routing - -------------------------------------------
//------------------------------------------------------------------------------

// GET Home

app.get('/', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


//GET urls

app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userUrls, user: users[userID] };
  
  if (!userID) {
    res.statusCode = 401;
  }
  
  res.render('urls_index', templateVars);

});

// GET New URL

app.get("/urls/new", (req, res) => {
  if (req.session.userID) {
    const templateVars = {user: users[req.session.userID]};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// GET shortURL

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urlDatabase, userUrls, shortURL, user: users[userID] };

  if (!urlDatabase[shortURL]) {
    const errorMessage = 'This short URL does not exist.';
    res.status(404).render('urls_error', {user: users[userID], errorMessage});
  } else if (!userID || !userUrls[shortURL]) {
    const errorMessage = 'You are not authorized to see this URL.';
    res.status(401).render('urls_error', {user: users[userID], errorMessage});
  } else {
    res.render('urls_show', templateVars);
  }
});

// GET shortURL Access

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    const errorMessage = 'This short URL does not exist.';
    res.status(404).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});

//GET Login

app.get('/login', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {user: users[req.session.userID]};
  res.render('urls_login', templateVars);
});

// GET Register
app.get('/register', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {user: users[req.session.userID]};
  res.render('urls_register', templateVars);
});

// ------------------ POST Routing Section----------------------------------------------------

app.post("/urls", (req, res) => {
  if (req.session.userID) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    const errorMessage = 'You must be logged in to do that.';
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});


// Deleting URLs POST

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.userID  && req.session.userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    const errorMessage = 'You are not authorized to do that.';
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});


// Edit URLs POST

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.userID  && req.session.userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    res.redirect(`/urls`);
  } else {
    const errorMessage = 'You are not authorized to do that.';
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});

// login POST

app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.userID = user.userID;
    res.redirect('/urls');
  } else {
    const errorMessage = 'Login credentials not valid. Please make sure you enter the correct username and password.';
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});

// Register POST

app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {

    if (!getUserByEmail(req.body.email, users)) {
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.userID = userID;
      res.redirect('/urls');
    } else {
      const errorMessage = 'Cannot create new account, because this email address is already registered.';
      res.status(400).render('urls_error', {user: users[req.session.userID], errorMessage});
    }

  } else {
    const errorMessage = 'Empty username or password. Please make sure you fill out both fields.';
    res.status(400).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});

// logout POST

app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/urls');
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

