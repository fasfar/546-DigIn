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
    async addRecipe(title, author, ingredients, instructions, tags, picture){ //leaving picture out for now
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
        if(!pictures){
            throw 'You must provide a photo'
        }
        if(typeof pictures != 'string'){
            throw 'Please provide a file path to your photo'
        }
        const recipeCollection = await recipes()
        let newRecipe = {
            title: title, 
            author: author, 
            ingredients: ingredients, // list of objects
            instructions: instructions,
            likes: [],
            total_likes: 0,
            tags: tags, 
            comments: "",
            pictures: picture
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
    async addCommentToRecipe(recipeId, commentId){
        let currentRecipe = this.getRecipeById(recipeId)

        const recipeCollection = await recipes()
        const updateInfo = await recipeCollection.updateOne(
            {_id: recipeId}, 
            {$addtoSet: {comments: {id: commentId}}}
        )
        if(!updateInfo.matchedCount && !updateInfo.modifiedCount){
            throw 'Update failed'
        }
        return await this.getRecipeById(recipeId)

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
   },

   //gets recipe by title 
   async getRecipeByTitle(title){
       if(!title){
           throw 'No title provided.'
       }
       const recipeCollection = await recipes()
       return await recipeCollection
       .find({'title' : title})     //not sure if this is the right way to search. I think so based of lab 6 codebase
       .toArray()
   },

   async getRecipeByTag(tag){
       if(!tag){
           throw 'No tag provided'
       }
       if(typeof tag != 'string'){
           throw 'tag is not in string format.'
       }
       const recipeCollection = recipes()
       return await recipeCollection
       .find({'tag': tag})
       .toArray()
   }, 

   async getRecipeByAuthor(author){
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
   },

   async getRecipeByIngredients(ingredients){
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
   },
   
   //update title of recipe
   async updatedTitle(id, updatedTitle){
       if(!id){
           throw 'You must provide an id'
       }
       let obj = ObjectId(id)
       var objId = require('mongodb').ObjectID
       if(!objId.isValid(obj)){
           throw ` ${objId} is not a proper mongo id`
       }
       if(!updatedTitle){
           throw 'You must provide a title'
       }
       if(typeof updatedTitle != 'string'){
           throw 'Title must be a string'
       }
       const recipeCollection = recipes()
       return await recipeCollection
       .updateOne({ _id: id }, { $set: { title: updatedTitle } })
       .then(async function () {
         return await module.exports.getRecipeById(id);
       });

   },

   async updatedAuthor(id, updatedAuthor){
    if(!id){
        throw 'You must provide an id'
    }
    let obj = ObjectId(id)
    var objId = require('mongodb').ObjectID
    if(!objId.isValid(obj)){
        throw ` ${objId} is not a proper mongo id`
    }
    if(!updatedAuthor){
        throw 'You must provide a name'
    }
    if(typeof updatedAuthor != 'string'){
        throw 'Author must be a string'
    }
    const recipeCollection = recipes()
    return await recipeCollection
    .updateOne({_id: id}, {$set: {author : updatedAuthor}})
    .then(async function(){
        return await module.exports.getRecipeById(id)
    });
   },
   //update ingredients
   async updatedIngredients(id, updatedIngredients){
    if(!id){
        throw 'You must provide an id'
    }
    let obj = ObjectId(id)
    var objId = require('mongodb').ObjectID
    if(!objId.isValid(obj)){
        throw ` ${objId} is not a proper mongo id`
    }
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
    return await recipeCollection
    .updateOne({ _id: id }, { $push: { ingredient: {$each: updatedIngredients} } })     //adds each element of the updatedIngredients to the existing array
      .then(async function () {
        return await module.exports.getRecipeById(id);
      })
   },
   async updatedInstructions(id, updatedInstructions){
       if(!id){
           throw 'You must provide an id'
       }
       if (!id.trim()){
        throw 'Id is an empty string';
    } 
       let obj = ObjectId(id)
       var objId = require('mongodb').ObjectID
       if(!objId.isValid(obj)){
           throw ` ${objId} is not a proper mongo id`
       }
       if(!updatedInstructions){
           'No new instructions were given.'
       }
       if(typeof updatedInstructions != 'string'){
           throw 'The new instructions must be in string format'
       }
       const recipeCollection = await recipes()
       return await recipeCollection
       .updateOne({_id: id}, {$set: { instructions: updatedInstructions}})
       .then(async function(){
           return await module.exports.getRecipeById(id)
       })  
   },
   async updatePicture(id, updatedPicture){
    if(!id){
        throw 'You must provide an id'
    }
    if (!id.trim()){
     throw 'Id is an empty string';
 } 
    let obj = ObjectId(id)
    var objId = require('mongodb').ObjectID
    if(!objId.isValid(obj)){
        throw ` ${objId} is not a proper mongo id`
    }
    if(!updatedPicture){
        throw 'Provide a picture file path'
    }
    if(typeof updatedPicture !='string'){
        throw 'picture is not a file path'
    }
    const recipeCollection = await recipes()
    return await recipeCollection
    .updateOne({_id: id}, {$set: { picture: updatedPicture}})
    .then(async function(){
        return await module.exports.getRecipeById(id)
    })  

   },

   async updateRecipe(id, updatedTitle, updatedAuthor, updatedIngredients, updatedInstructions, updatedPicture){
    let recipe = this.getRecipeById(id);   
    if(updatedTitle && updatedTitle != recipe.title){
        updatedTitle(id, updatedTitle)
    }
    if(updatedAuthor && updatedAuthor != recipe.author){
        updatedAuthor(id, updatedAuthor)
    }
    if(updatedIngredients && updatedIngredients != recipe.ingredients){
        updatedIngredients(id, updatedIngredients)
    }
    if(updatedInstructions && updatedInstructions!= recipe.instructions){
        updatedInstructions(id, updatedInstructions)
    }
    if(updatedPictures && updatedPictures != recipe.updatedPictures){
        updatedPicture(id, updatedPicture)
    }
   },

   async removeRecipe(id){
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


  
}


//make an updateAll and call the existing methods inside.