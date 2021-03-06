
const express = require('express');
const { parseConnectionString } = require('mongodb/lib/core');
const router = express.Router();
const data = require('../data');
const { getRecipeById } = require('../data/recipes');
const recipeData = data.recipes;
const commentData = data.comments;
const userData = data.users;
const likesData = data.likes;
const xss = require('xss');

const makeArray = function makeArray(str){
  let arr = str.split(',');
  let newArr = arr.map(value => value.trim());
  return newArr;
}

router.get('/id/:id', async (req, res) => {
  let user = req.session.user;
  let like_dislike = "Like";
  let is_liked = false;
  if(req.session.user){
    try{
      is_liked = await likesData.checkIfLiked(xss(req.params.id), xss(user._id));
      if(is_liked){
        like_dislike = "Remove like";
      }
    } catch (e) {
      res.status(404).json({ error: e.toString()});
    }
    let ownRecipe;
    try{
      ownRecipe = await recipeData.ownRecipe(xss(req.params.id), xss(user._id));
    } catch (e) {
      res.status(404).json({ error: e.toString()});
    }
    try {
      const recipe = await recipeData.getRecipeById(xss(req.params.id));
      let commentList = await commentData.ownComment(xss(req.params.id), user._id.toString());
      if(await userData.hasRecipeSaved(req.session.user._id, xss(req.params.id)))
      return res.render("recipes/recipe", {recipe: recipe, like_dislike: like_dislike, own_recipe: ownRecipe, comments: commentList, savedRecipe: true});
      else return res.render("recipes/recipe", {recipe: recipe, like_dislike: like_dislike, own_recipe: ownRecipe, comments: commentList});
    } catch (e) {
      res.status(404).json({ error: e.toString()});
    }
  }
  else{
    req.session.error = "403: Unauthorized User"
    res.redirect('/')
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
      res.render("recipes/editRecipe", {id: xss(req.params.id)});
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
  if (!xss(recipe.title)) {
    res.status(400).json({ error: 'You must provide recipe title' });
    return;
  }
  if (!xss(recipe.ingredients)) {
    res.status(400).json({ error: 'You must provide recipe ingredients' });
    return;
  }
  if (!xss(recipe.tags)) {
    res.status(400).json({ error: 'You must provide recipe tags' });
    return;
  }
  if (!xss(recipe.instructions)) {
    res.status(400).json({ error: 'You must provide recipe instructions' });
    return;
  }
  if(req.session.user){
    try {
      const {title, ingredients, tags, instructions} = recipe;
      let author = req.session.user.username;
      let author_id = req.session.user._id;
      const newRecipe = await recipeData.addRecipe(title, author, author_id, makeArray(ingredients), instructions, makeArray(tags));
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
  if (!xss(updatedData.title) || !xss(updatedData.author) || !xss(updatedData.ingredients) || !xss(updatedData.tags) || !xss(updatedData.instructions)) {
    res.status(400).json({ error: 'You must supply all fields' });
    return;
  }
  try {
    await recipe.getRecipeById(xss(req.params.id));
  } catch (e) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }

  try {
    const updatedRecipe = await recipeData.updateRecipe(xss(req.params.id), updatedData);
    res.json(updatedRecipe);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.get('/addComment/:id', async (req, res) => {
  let recipe_id = xss(req.params.id);
  let recipe = {};
  try {
    recipe = await recipeData.getRecipeById(recipe_id);
  } catch (e) {
    res.status(500).json({ error: e });
  }
  if(req.session.user){
    try {
      res.render("recipes/addComment", {recipe_id: recipe_id, recipe_name: recipe.title});
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }
  else{
    req.session.error = "403: Unauthorized User"
    res.redirect('/')
  }
});

router.post('/addComment/:id', async (req, res) => {
  let commentInfo = req.body;
  let recipe_id = xss(commentInfo.id);
  let recipe;
  try {
    recipe = await recipeData.getRecipeById(recipe_id.toString());
  } catch (e) {
    res.status(500).json({ error: e });
  }
  let user = req.session.user;

 
  if(req.session.user){
    try {
      let comment = await commentData.createComment(recipe._id, user.username, user._id, xss(commentInfo.comment));
      let recipe2 = await recipeData.getRecipeById(recipe_id);
      res.redirect("/recipes/id/" + recipe_id);
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }
  else{
    req.session.error = "403: Unauthorized User"
    res.redirect('/')
  }
});

router.get('/toggleLike/:id', async (req, res) => {
  let recipe_id = xss(req.params.id);
  let recipe;
  try {
    recipe = await recipeData.getRecipeById(recipe_id);
  } catch (e) {
    res.status(500).json({ error: e });
  }
  let user = req.session.user;
  let user_name = user.username;
  let user_id = user._id;
  let likes = recipe.likes;

  if(req.session.user){
    try {
      let is_liked = await likesData.checkIfLiked(recipe._id, user_id);

      if(!is_liked){
        let like = await likesData.addLike(recipe._id, user_name, user_id);
      }
      else{
        let like = await likesData.remove(recipe._id, user_id);
      }

      res.redirect("/recipes/id/" + recipe_id);
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }
  else{
    req.session.error = "403: Unauthorized User"
    res.redirect('/')
  }
});

router.get('/likesList/:id', async (req, res) => {
  let recipe_id = xss(req.params.id);
  let recipe;
  try {
    recipe = await recipeData.getRecipeById(recipe_id);
  } catch (e) {
    res.status(500).json({ error: e });
  }
  let likes = recipe.likes;

  if(req.session.user){
    try {
      res.render("recipes/likesList", {users: likes});
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }
  else{
    req.session.error = "403: Unauthorized User"
    res.redirect('/')
  }
});

router.get('/commentsList/:id', async (req, res) => {
  let recipe_id = xss(req.params.id);
  let user = req.session.user;
  let comments;
  try {
    comments = await commentData.ownComment(recipe_id, user._id.toString());
  } catch (e) {
    res.status(500).json({ error: e });
  }

  if(req.session.user){
    try {
      res.render("recipes/commentsList", {comments: comments});
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }
  else{
    req.session.error = "403: Unauthorized User"
    res.redirect('/')
  }
});

router.get('/deleteComment/:commentId', async (req, res) => {
  let comment_id = xss(req.params.commentId);
  let comment;
  try {
    comment = await commentData.getById(comment_id);
  } catch (e) {
    res.status(500).json({ error: e });
  }
  let recipe_id = comment.recipeId;

  if(req.session.user){
    try {
      let deletion = await commentData.remove(comment_id);

      res.redirect("/recipes/id/" + recipe_id);
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }
  else{
    req.session.error = "403: Unauthorized User"
    res.redirect('/')
  }
});

router.patch('/edit/:id', async (req, res) => {
  const requestBody = req.body;
  let updatedObject = {};
  try {
    const oldRecipe = await recipeData.getRecipeById(xss(req.params.id));

    if (xss(requestBody.title) && xss(requestBody.title) !== oldRecipe.title){
      try{
        updatedObject.title = xss(requestBody.title);
      } catch(e){
        res.status(400).json({ error: 'Issue with title field. Try again.' });
      }
    }
    if (xss(requestBody.ingredients) && xss(requestBody.ingredients) !== oldRecipe.ingredients){
      try{
        updatedObject.ingredients = makeArray(requestBody.ingredients);
      } catch(e){
        res.status(400).json({ error: 'Issue with ingredients field. Try again.' });
      }
    }
    if (xss(requestBody.tags) && xss(requestBody.tags) !== xss(oldRecipe.tags)){
      try{
        updatedObject.tags = makeArray(xss(requestBody.tags));
        console.log(updatedObject.tags)
      } catch(e){
        res.status(400).json({ error: 'Issue with tags field. Try again.' });
      }
    }
    if (xss(requestBody.instructions) && xss(requestBody.instructions) !== oldRecipe.instructions){
      try{
        updatedObject.instructions = xss(requestBody.instructions);
      } catch(e){
        res.status(400).json({ error: 'Issue with instructions field. Try again.' });
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
        updatedObject.ingredients,
        updatedObject.tags,
        updatedObject.instructions
      );
      res.redirect("/recipes/id/" + xss(req.params.id));
      
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  } else {
    res.render("recipes/editRecipe", {id: xss(req.params.id), error: 'No fields have been changed from their inital values, so no update has occurred'});
  }
});

router.delete('/delete/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'You must supply an ID to delete' });
    return;
  }
  try {
    await recipeData.getRecipeById(xss(req.params.id));
  } catch (e) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }
  try {
    await recipeData.removeRecipe(xss(req.params.id));
  } catch (e) {
    res.status(500).json({ error: e });
  }
  res.render("recipes/recipeDeletedSuccessfully");
});
router.post('/searchByTag/:searchTerm', async(req, res)=>{   //this route is called be the ajax POST request when user presses search for recipe
  try{
    const recipeTag = xss(req.params.searchTerm);
  
    const recipes = await recipeData.getRecipeByTag(recipeTag);
    res.render('partials/search_item', {layout: null, recipes: recipes})    //this gives us the html partial
  }
  catch(e){
    res.status(404).json({error: "Recipes not found"})
  }

})
router.post('/searchByRecipeName/:searchTerm', async(req, res)=>{   //this route is called be the ajax POST request when user presses search for recipe
  try{
    const recipeName = xss(req.params.searchTerm);
    const recipes = await recipeData.getRecipeByTitle(recipeName);

    res.render('partials/search_item', {layout: null, recipes: recipes})    //this gives us the html partial
  }
  catch(e){
    res.status(404).json({error: "Recipes not found"})
  }

})
router.post('/searchByAuthor/:searchTerm', async(req, res)=>{   //this route is called be the ajax POST request when user presses search for recipe
  try{
    const author = xss(req.params.searchTerm)
    const recipes = await recipeData.getRecipeByAuthor(author);
    res.render('partials/search_item', {layout: null, recipes: recipes})    //this gives us the html partial
  }
  catch(e){
    res.status(404).json({error: "Recipes not found"})
  }

})

module.exports = router;
