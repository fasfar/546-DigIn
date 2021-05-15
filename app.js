const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');
const session = require('express-session');
const configRoutes = require('./routes');
const exphbs = require('express-handlebars');

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var hbs = exphbs.create({});

hbs.handlebars.registerHelper('each_upto', function(ary, max, options) {
  if(!ary || ary.length == 0)
      return options.inverse(this);

  var result = [ ];
  for(var i = 0; i < max && i < ary.length; ++i)
      result.push(options.fn(ary[i]));
  return result.join('');
});

const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  // Specify helpers which are only registered on this instance.
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === 'number')
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

      return new Handlebars.SafeString(JSON.stringify(obj));
    }
  },
  partialsDir: ['views/partials/']
});

app.engine('handlebars', handlebarsInstance.engine);

app.set('view engine', 'handlebars');




app.use('/recipes/edit/:id', async (req, res, next) => {
  if(req.method==='POST'){
    req.method='PATCH';
  }
  next();
});

app.use('/recipes/delete/:id', async (req, res, next) => {
  if(req.method==='GET'){
    req.method='DELETE';
  }
  next();
});

app.use('/follow/:id', async (req, res, next) => {
  if(req.method === 'POST'){
    req.method = 'PATCH';
  }
  next();
})

app.use('/saveRecipe/:id', async (req, res, next) => {
  if(req.method === 'POST'){
    req.method = 'PATCH';
  }
  next();
})

app.use(session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: true
  }));

app.use('/editUser', (req, res, next) =>{
  if(req.method == 'POST'){
    req.method = 'PATCH';
  }
  next();
})

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});