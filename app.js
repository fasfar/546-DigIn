const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');
const session = require('express-session');
const configRoutes = require('./routes');
const exphbs = require('express-handlebars');

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use('/recipes/edit/:id', async (req, res, next) => {
  console.log(req.method);
  if(req.method==='POST'){
    req.method='PATCH';
  }
  console.log(req.method);
  next();
});

app.use('/recipes/delete/:id', async (req, res, next) => {
  if(req.method==='GET'){
    req.method='DELETE';
  }
  next();
});


app.use(session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: true
  }));


configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
/* Write authorization middleware for trying to access any route other than login page*/
