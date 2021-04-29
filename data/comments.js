const mongoCollections = require("../config/mongoCollections")
const recipes = mongoCollections.recipes
const {ObjectId} = require('mongodb');
const allRecipes = require('./recipes')
const user = require('./users')

//DO WE WANT TO MAKE COMMENTS A COLLECTION?

module.exports = {

    async createComment(user, message, recipeId){
        if(!user){
            throw 'No user provided'
        }
        if(typeof user != "object"){        //this needs to be if user is a user object
            throw 'User is not of user type'
        }
        if(!message){
            throw 'No comment provided'
        }
        if(typeof message != 'string'){
            throw "Comment is not a string"
        }
        const recipeCollection = await recipes()
        let newComment = {
            user: user, 
            message: message
        }
        const insertInfo = await recipeCollection.updateOne({_id: recipeId}, {$addToSet: {_id: recipeId, comments: newComment}})
        return await this.recipes.getRecipeById(recipeId)

    }
    // async delete(id){
    //     if (!id){

    //         throw 'You must provide an id';
    //        }
    //        if (typeof id !== 'string'){
   
    //            throw 'id must be a string';
    //        }
    //        if (!id.trim()){
   
    //         throw 'id is an empty string';
    //        }
    //        id.trim();
       
    //        let obj = ObjectId(id);
    //}
}