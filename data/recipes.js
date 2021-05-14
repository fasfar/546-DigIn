/*
*TODO: Implement recipes data functions. These functions handle our interactions with our recipes data collection.*
    * getRecipe(id): returns a Recipe object corresponding to the ObjectId input string.
        - error check id parameter - valid type/format
        - throw if object not found
        - return recipe object with fields as appropriate strings
    * updateRecipe(id, newRecipe, updateAll): update the respective parameter(s) according to the provided object. All parameters must be provided if updateAll == true.
        - 
    * addRecipe(name,author, ingredients, instructions, tags, pictures)
        - we can error check the instructions input string to make sure it follows a specific format using regex that we can redesign later on
        - Initialize likes/total likes to empty array/0
    * removeRecipe(id)
        -
    * getRecipesBy(criteria)
        - search for recipes by tags, ingredients they contain, keywords, etc
        - recipes to fill feed page
*/
const mongoCollections = require("../config/mongoCollections")
const recipes = mongoCollections.recipes
const {ObjectId} = require('mongodb');
const userData = require('./users.js')
//const { recipes } = require("../config/mongoCollections");

//get all recipes
async function addRecipe(title, author, author_id, ingredients, instructions, tags, picture){ //leaving picture out for now
    if(!title){
        throw 'Please provide a recipe title'
    }
    if(typeof title != 'string'){
        throw 'Please provide a proper title(words)'
    }
    if(!ingredients){                           //ingredients might have to be a subdocument because we need to separate quantity and ingredient for lookup
        throw 'Please provide ingredients.'
    }
    if(!tags){
        throw 'Please provide a tag(s).'
    }
    if(!Array.isArray(tags)){
        throw 'Not an array'
    }
    if(!Array.isArray(ingredients)){
        throw 'Ingredients must be an array'
    }
    if(Array.isArray(ingredients)){
        for(i=0; i<ingredients.length; i++){
            if(typeof ingredients[i] != 'string'){
                throw `Ingredient ${ingredients[i]} is not a string`
            }
        }
    }
    if(!instructions){
        throw 'Please provide instructions for your recipe'
    }
    if(typeof instructions != 'string'){
        throw 'Please provide instructions using words(strings)'
    }
    if(!picture){
        throw 'You must provide a photo'
    }
    if(typeof picture != 'string'){
        throw 'Please provide a file path to your photo'
    }
    const recipeCollection = await recipes()
    
    let newRecipe = {
        title: title, 
        author: author, 
        author_id: author_id,
        ingredients: ingredients, // list of objects
        instructions: instructions,
        likes: [],
        total_likes: 0,
        tags: tags, 
        comments: [],
        pictures: picture
    }
    
    const insertRecipe = await recipeCollection.insertOne(newRecipe)
    if(insertRecipe.insertCount === 0){
        throw 'Could not add recipe'
    }
    const newId = insertRecipe.insertedId.toString()
    const added_recipe = await this.getRecipeById(newId)

    //add recipe to author's own_recipes array
    let user = await userData.getUserByUsername(author);
    await userData.addRecipe(user._id,newId);

    return {
        _id : newId,
        title: title, 
        author: author, 
        author_id: author_id,
        ingredients: ingredients, // list of objects
        instructions: instructions,
        likes: [],
        total_likes: 0,
        tags: tags, 
        comments: [],
        pictures: picture
    };
    

}


async function getAllRecipes(){
    const recipeCollection = await recipes()
    const recipeList = await recipeCollection.find({}).toArray()
    
    //create new list with the ids converted to strings
    const recipesToReturn = [];
    for(let i = 0; i < recipeList.length; i++){
        let recipe = recipeList[i];
        let x = {
            _id: recipe._id.toString(),
            title: recipe.title, 
            author: recipe.author, 
            author_id: recipe.author_id,
            ingredients: recipe.ingredients, // list of objects
            instructions: recipe.instructions,
            likes: recipe.likes,
            total_likes: recipe.total_likes,
            tags: recipe.tags, 
            comments: recipe.comments,
            pictures: recipe.pictures
        };
        recipesToReturn.push(x);
    }

    return recipesToReturn;
}

//gets a recipe by id
async function getRecipeById(id){
    if(!id){
        throw `Please provide a recipe id`
    }
    if(typeof id.toString() != "string"){
        throw ` Not a proper recipe id`
    }
    id.toString().trim()
    let obj = ObjectId(id)
    var objId = require('mongodb').ObjectID
    if(!objId.isValid(obj)){
        throw ` ${objId} is not a proper mongo id`
    }
    const recipeCollection = await recipes();
    const recipe = await recipeCollection.findOne({_id: obj});
    if(recipe == null){
        throw `Could not find the recipe with id ${id}`
    }
    return recipe;
}

//gets recipe by title 
async function getRecipeByTitle(title){
    if(!title){
        throw 'No title provided.'
    }
    const recipeCollection = await recipes()
    return await recipeCollection
    .find({'title' : title})     //not sure if this is the right way to search. I think so based of lab 6 codebase
    .toArray()
}

async function getRecipeByTag(tag){
    if(!tag){
        throw 'No tag provided'
    }
    if(typeof tag != 'string'){
        throw 'tag is not in string format.'
    }
    const recipeCollection = await recipes()
    return await recipeCollection
    .find({'tags': tag})
    .toArray()
}

async function getRecipeByAuthor(author){
    if(!author){
        throw 'No author given.'
    }
    if(typeof author != 'string'){
        throw 'Author must be in string format.'
    }
    const recipeCollection = await recipes()
    return await recipeCollection
    .find({'author': author})
    .toArray()
}

async function getRecipeByIngredients(ingredients){
    if(!ingredients){
        throw 'No ingredient given'
    }
    if(!Array.isArray(ingredients)){
        throw 'Ingredients must be an array of strings'
    }
    if(Array.isArray(ingredients)){
        for(i=0; i<ingredients.length; i++){
            if(typeof ingredients[i] != 'string'){
                throw `Ingredient ${ingredients[i]} is not a string`
            }
        }
    }
    const recipeCollection = await recipes()
    return await recipeCollection
    .find({'ingredients': { $in: ingredients}})
    .toArray()
}

async function ownRecipe(recipe_id, user_id){
    let recipe = await getRecipeById(recipe_id);
    let recipe_author = recipe.author_id;

    if(user_id === recipe_author){
        return true;
    }
    else{
        return false;
    }
}

//update title of recipe
async function updatedTitle(id, updatedTitle){
    if(!id){
        throw 'You must provide an id'
    }
    let obj = ObjectId(id)
    // var objId = require('mongodb').ObjectID
    // if(!objId.isValid(obj)){
    //     throw ` ${objId} is not a proper mongo id`
    // }
 
    if(!updatedTitle){
        throw 'You must provide a title'
    }
    if(typeof updatedTitle != 'string'){
        throw 'Title must be a string'
    }
    
    const recipeCollection = await recipes();
    
    await recipeCollection.updateOne({ _id: obj }, { $set: { title: updatedTitle } });
    return await module.exports.getRecipeById(id);

}

async function updatedAuthor(id, uAuthor){
    if(!id){
        throw 'You must provide an id'
    }
    let obj = ObjectId(id)
    //var objId = require('mongodb').ObjectID
    if(!uAuthor){
        throw 'You must provide a name'
    }
    if(typeof uAuthor != 'string'){
        throw 'Author must be a string'
    }
    const recipeCollection = await recipes();
    let newRecipe = await recipeCollection.updateOne({_id: obj}, {$set: {author : uAuthor}});
    console.log(newRecipe);
    console.log(await module.exports.getRecipeById(id));
    return await module.exports.getRecipeById(id);
}

//update ingredients
async function updatedIngredients(id, updatedIngredients){
    if(!id){
        throw 'You must provide an id'
    }
    let obj = ObjectId(id)
    //var objId = require('mongodb').ObjectID
    // if(!objId.isValid(obj)){
    //     throw ` ${objId} is not a proper mongo id`
    // }
    if(!updatedIngredients){
        throw 'You must provide ingredients'
    }
    if(!Array.isArray(updatedIngredients)){
        throw 'Ingredients must be an array of strings'
    }
    if(Array.isArray(updatedIngredients)){
        for(i=0; i<updatedIngredients.length; i++){
            if(typeof updatedIngredients[i] != 'string'){
                throw 'the ingredient must be a string'
            }
        }
    }
    const recipeCollection = await recipes()
    await recipeCollection.updateOne({ _id: obj }, { $push: { ingredients: {$each: updatedIngredients} } });     //adds each element of the updatedIngredients to the existing array
    return await module.exports.getRecipeById(id);
}

async function updatedInstructions(id, updatedInstructions){
    if(!id){
        throw 'You must provide an id'
    }
    if (!id.trim()){
    throw 'Id is an empty string';
} 
    let obj = ObjectId(id)
    //var objId = require('mongodb').ObjectID
    // if(!objId.isValid(obj)){
    //     throw ` ${objId} is not a proper mongo id`
    // }
    if(!updatedInstructions){
        'No new instructions were given.'
    }
    if(typeof updatedInstructions != 'string'){
        throw 'The new instructions must be in string format'
    }
    const recipeCollection = await recipes();
    await recipeCollection.updateOne({_id: obj}, {$set: { instructions: updatedInstructions}});
    return await module.exports.getRecipeById(id);
}

async function updatedPicture(id, updatedPicture){
    if(!id){
        throw 'You must provide an id'
    }
    if (!id.trim()){
        throw 'Id is an empty string';
    } 
    let obj = ObjectId(id)
    //var objId = require('mongodb').ObjectID
    // if(!objId.isValid(obj)){
    //     throw ` ${objId} is not a proper mongo id`
    // }
    if(!updatedPicture){
        throw 'Provide a picture file path'
    }
    if(typeof updatedPicture !='string'){
        throw 'picture is not a file path'
    }
    const recipeCollection = await recipes();
    await recipeCollection.updateOne({_id: obj}, {$set: { pictures: updatedPicture}});
    return await module.exports.getRecipeById(id);

}

async function updateRecipe(id, uTitle, uIngredients, uInstructions, uPicture){
    let recipe = this.getRecipeById(id); 
    
    if(uTitle && uTitle != recipe.title){
        await updatedTitle(id, uTitle);
    }
   
    if(uIngredients && uIngredients != recipe.ingredients){
        await updatedIngredients(id, uIngredients.split(','))
    }
    
    if(uInstructions && uInstructions!= recipe.instructions){
        await updatedInstructions(id, uInstructions)
    }
   
    if(uPicture && uPicture != recipe.pictures){
        await updatedPicture(id, uPicture)
    }

    return await module.exports.getRecipeById(id);
    
}

async function removeRecipe(id){
    if (!id){
        throw 'You must provide an id' ;
    } 
    if (typeof id !== 'string'){

    throw 'id must be a string';
    }
    if (!id.trim()){
        throw 'Id is an empty string';
    } 
    id.trim();
    let obj = ObjectId(id)
    const recipeCollection = await recipes()
    let recipe = null
    try{
        recipe = await this.getRecipeById(id)
    }catch(e){
        console.log(e)
        return
    }
    const deletionInfo = await recipeCollection.removeOne({_id: obj})
    if(deletionInfo.deletedCount === 0){
        throw `Could not delete recipe with id of ${id}`
    }
    let myRecipe = {
        recipeId : recipe._id,
        deleted: true
    }
    return myRecipe
}

module.exports = {
    addRecipe,
    getAllRecipes,
    getRecipeById,
    getRecipeByAuthor,
    getRecipeById,
    getRecipeByIngredients,
    getRecipeByTag,
    getRecipeByTitle,
    ownRecipe,
    updateRecipe,
    updatedAuthor,
    updatedIngredients, 
    updatedInstructions,
    updatedPicture,
    updatedTitle,
    removeRecipe
};

//make an updateAll and call the existing methods inside.