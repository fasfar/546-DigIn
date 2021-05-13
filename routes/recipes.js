
const express = require('express');
const { parseConnectionString } = require('mongodb/lib/core');
const router = express.Router();
const data = require('../data');
const recipeData = data.recipes;

const makeArray = function makeArray(str){
  return str.split(',');
}

router.get('/id/:id', async (req, res) => {
  try {
    const recipe = await recipeData.getRecipeById(req.params.id);
    res.render("recipes/recipe", {recipe: recipe});
  } catch (e) {
    res.status(404).json({ error: 'Recipe not found' });
  }
});

router.get('/', async (req, res) => {
  if(req.session.user){
    try {
      const recipeList = await recipeData.getAllRecipes();
      res.render("recipes/allRecipes", {all_recipe_list: recipeList});
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }
  else{
    req.session.error = "403: Unauthorized User"
    res.redirect('/')
  }
});


router.get('/addRecipe', async (req, res) => {
  if(req.session.user){
    try {
      res.render("recipes/addRecipe");
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }
  else{
    req.session.error = "403: Unauthorized User"
    res.redirect('/')
  }
});

router.get('/edit/:id', async (req, res) => {
  if(req.session.user){
    try {
      res.render("recipes/editRecipe", {id: req.params.id});
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }
  else{
    req.session.error = "403: Unauthorized User"
    res.redirect('/')
  }
});

router.post('/', async (req, res) => {
  const recipe = req.body;

  if(!recipe){
    res.status(400).json({ error: 'You must provide recipe information' });
    return;
  }
  if (!recipe.title) {
    res.status(400).json({ error: 'You must provide recipe title' });
    return;
  }
  if (!recipe.ingredients) {
    res.status(400).json({ error: 'You must provide recipe ingredients' });
    return;
  }
  if (!recipe.tags) {
    res.status(400).json({ error: 'You must provide recipe tags' });
    return;
  }
  if (!recipe.instructions) {
    res.status(400).json({ error: 'You must provide recipe instructions' });
    return;
  }
  if (!recipe.pictures) {
    res.status(400).json({ error: 'You must provide recipe picture' });
    return;
  }
  if(req.session.user){
    try {
      const {title, ingredients, tags, instructions, pictures} = recipe;
      let author = req.session.user.username;
      let author_id = req.session.user._id;
      const newRecipe = await recipeData.addRecipe(title, author, author_id, makeArray(ingredients), instructions, makeArray(tags), pictures);
      res.render("recipes/recipeAddedSuccessfully");
    } catch (e) {
      res.status(400).json({ error: e.toString() });
    }
  }
  else{
    req.session.error = "403: Unauthorized User"
    res.redirect('/')
  }
});

router.put('/:id', async (req, res) => {
  const updatedData = req.body;
  if (!updatedData.title || !updatedData.author || !updatedData.ingredients || !updatedData.tags || !updatedData.instructions || !updatedData.pictures) {
    res.status(400).json({ error: 'You must supply all fields' });
    return;
  }
  try {
    await recipe.getRecipeById(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }

  try {
    const updatedRecipe = await recipeData.updateRecipe(req.params.id, updatedData);
    res.json(updatedRecipe);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.patch('/edit/:id', async (req, res) => {
  const requestBody = req.body;
  let updatedObject = {};
  try {
    const oldRecipe = await recipeData.getRecipeById(req.params.id);

    if (requestBody.title && requestBody.title !== oldRecipe.title){
      try{
        updatedObject.title = requestBody.title;
      } catch(e){
        res.status(400).json({ error: 'Issue with title field. Try again.' });
      }
    }
    if (requestBody.author && requestBody.author !== oldRecipe.author){
      try{
        updatedObject.author = requestBody.author;
      } catch(e){
        res.status(400).json({ error: 'Issue with author field. Try again.' });
      }
    }
    if (requestBody.ingredients && requestBody.ingredients !== oldRecipe.ingredients){
      try{
        updatedObject.ingredients = requestBody.ingredients;
      } catch(e){
        res.status(400).json({ error: 'Issue with ingredients field. Try again.' });
      }
    }
    if (requestBody.tags && requestBody.tags !== oldRecipe.tags){
      try{
        updatedObject.tags = requestBody.tags;
      } catch(e){
        res.status(400).json({ error: 'Issue with tags field. Try again.' });
      }
    }
    if (requestBody.instructions && requestBody.instructions !== oldRecipe.instructions){
      try{
        updatedObject.instructions = requestBody.instructions;
      } catch(e){
        res.status(400).json({ error: 'Issue with instructions field. Try again.' });
      }
    }
    if (requestBody.pictures && requestBody.pictures !== oldRecipe.pictures){
      try{
        updatedObject.pictures = requestBody.pictures;
      } catch(e){
        res.status(400).json({ error: 'Issue with pictures field. Try again.' });
      }
    }
  } catch (e) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }
  if (Object.keys(updatedObject).length !== 0) {
    try {
      const updatedRecipe = await recipeData.updateRecipe(
        req.params.id,
        updatedObject.title,
        updatedObject.author,
        updatedObject.ingredients,
        updatedObject.instructions,
        updatedObject.pictures
      );
      res.render("recipes/recipe", {recipe: updatedRecipe});
      
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  } else {
    res.status(400).json({
      error:
        'No fields have been changed from their inital values, so no update has occurred'
    });
  }
});

router.delete('/delete/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'You must supply an ID to delete' });
    return;
  }
  try {
    await recipeData.getRecipeById(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }
  try {
    await recipeData.removeRecipe(req.params.id);
  } catch (e) {
    res.status(500).json({ error: e });
  }
  res.render("recipes/recipeDeletedSuccessfully");
});
router.post('/search/:searchTerm', async(req, res)=>{   //this route is called be the ajax POST request when user presses search for recipe
  try{
    const recipeTag = req.params.searchTerm
  
    const recipes = await recipeData.getRecipeByTag(recipeTag);
    console.log(recipes)
    res.render('partials/search_item', {layout: null, recipes: recipes})    //this gives us the html partial
  }
  catch(e){
    res.status(404).json({error: "Recipes not found"})
  }

})

module.exports = router;
