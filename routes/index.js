<<<<<<< HEAD
const recipesRoutes = require('./recipes');


const constructorMethod = (app) => {
  app.use('/recipes', recipesRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

module.exports = constructorMethod;
=======
const userRoutes = require('./users');
const recipeRoutes = require('./recipes')

const constructorMethod = (app) => {
    app.use('/', userRoutes);
    app.use('/recipes',recipeRoutes)
    app.use('*', (req, res) => {
      res.sendStatus(404);
    });
  };
  
  module.exports = constructorMethod;
>>>>>>> 7efa36a2ee028a5e6f4b7c85aec9bbdcda6faaa2
