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
//const { recipes } = require("../config/mongoCollections");
module.exports = {
    //get all recipes
    async addRecipe(title, author, ingredients, instructions, likes=[], total_likes=0,tags=[], comments=[], pictures="empty"){
        var insert_likes = [];
        var insert_total_likes = 0
        if(!title){
            throw 'Please provide a recipe title'
        }
        if(typeof title != 'string'){
            throw 'Please provide a proper title(words)'
        }
        //We need to figure out how we want to do the authors/users --> firebase?
        if(!author){
            throw 'Please provide an author'
        }
        if(typeof author != 'string'){
            throw 'Please provide a proper author(string)'
        }
        if(!ingredients){
            throw 'Please provide ingredients.'
        }
        
        if(likes && total_likes){
            if(!Array.isArray(likes)){
                throw 'Likes is not an array of users'
            }
            if(typeof total_likes != 'number'){
                throw 'Total likes are not in numeric form'
            }
            if(Array.isArray(likes)){
                for(i=0; i<likes;i++){
                    if(typeof likes[i] !='string'){
                        throw `${likes[i]} is not a string`
                    }
                }
            }
            insert_likes = likes
            insert_total_likes = total_likes
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
        // if(!pictures){
        //     throw 'You must provide a photo'
        // }
        const recipeCollection = await recipes()
        let newRecipe = {
            title: title, 
            author: author, 
            ingredients: ingredients, 
            instructions: instructions,
            likes: insert_likes,
            total_likes: insert_total_likes,
            tags: tags, 
            comments: comments,
            pictures: pictures
        }
        const insertRecipe = await recipeCollection.insertOne(newRecipe)
        if(insertRecipe.insertCount === 0){
            throw 'Could not add recipe'
        }
        const newId = insertRecipe.insertedId.toString()
        return recipe = await this.getRecipeById(newId)
        

    },
    async getAllRecipes(){
        const recipeCollection = await recipes()
        const recipeList = await recipeCollection.find({}).toArray()
        return recipeList
    },
    //gets a recipe by id
   async getRecipeById(id){
    if(!id){
        throw `Please provide a recipe id`
    }
    if(typeof id != "string"){
        throw ` Not a proper recipe id`
    }
    if(!id.trim()){
        throw `Please provide a recipe id`
    }
    id.trim()
    let obj = ObjectId(id)
    var objId = require('mongodb').ObjectID
    if(!objId.isValid(obj)){
        throw ` ${objId} is not a proper mongo id`
    }
    const recipeCollection = await recipes()
    const recipe = recipeCollection.findOne({_id: obj})
    if(recipe == null){
        throw `Could not find the recipe with id ${id}`
    }
    let recipeId = recipe.toString()
    return recipeId
   }
   
//    async updateRecipe(id, updatedRecipe){
//     if (!id){
//         throw 'You must provide an id' ;
//     } 
//     if (typeof id !== 'string'){

//     throw 'id must be a string';
//     }
//     if (!id.trim()){
//         throw 'Id is an empty string';
//     } 
//     id.trim();
//    }
//    if(!updatedRecipe.name){
//        throw 'No name provided'
//    }
  
}


