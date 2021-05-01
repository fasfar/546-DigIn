const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users
const recipeData = data.recipes;

router.get('/:id', async (req, res) => {
    try {
      const recipe = await recipeData.getRecipeById(req.params.id);
      //res -> render or sendFile?;
    } catch (e) {
      res.status(404)//render/sendFile;
    }
});


router.post('/', async (req, res) => {
    const inputData = req.body;
    if(!inputData.title || !inputData.author || !inputData.ingredients || !inputData.instructions || !inputData.tags){
        res.status(400)//render/sendFile;
    }
    try{
        const {title, author, ingredients, instructions, tags} = inputData;
        const newRecipe = await recipeData.addRecipe(title, author, ingredients, instructions, tags);
        res.status(200)//render/sendFile;
        return;
    }
    catch (e) {
        res.status(400)//render/sendFile        
    }  
});

router.patch('/:id', async (req, res) => {
    const inputData = req.body;
    if(!inputData.title && !inputData.author && !inputData.ingredients && !inputData.instructions && !inputData.tags){
        res.status(400)//render/sendFile
        return;
    }
    try{
        await recipeData.getRecipeById(req.params.id);
    }
    catch (e) {
        res.status(404)//render/sendFile
        return;
    }
    try{
        const updatedRecipe = await recipeData.updatedRecipe(req.params.id, inputData,1);
        res.status(200)//render/sendFile
        return;
    }
    catch (e){
        res.status(400)//render/sendFile
    }
});


module.exports = router;

/*
*TODO: Implement Recipes route functions. These functions will dictate how are data functions are accessed.*

    ROUTES NEEDED:
    * PATCH route to update recipe information
    * PUT route to change entire recipe information
    * POST route to add new recipe
    * DELETE route to delete recipe
        - can only be accessed by author of 
    * GET Recipe object
    * GET Recipe comments
    * GET Recipe abstractions to post on feed--> title and photo.

*/
