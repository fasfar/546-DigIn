const mongoCollections = require("../config/mongoCollections")
const recipes = mongoCollections.recipes
const {ObjectId} = require('mongodb');
const allRecipes = require('./recipes')
const user = require('./users');
const { getAllRecipes } = require("./recipes");

//DO WE WANT TO MAKE COMMENTS A COLLECTION?
const str_err_check = function str_err_check(str, param_name){
    if(!str){
        throw `Please provide ${param_name}`
    }
    if(str.trim() === 0){
        throw `Invalid: ${param_name} is empty, it must not only have spaces.`
    }
    if(typeof str != 'string'){
        throw `Invalid: ${param_name} is not a string`
    }
    return 1
}
module.exports = {
   

    async createComment(id, user, comment){
        str_err_check(id, "id")
        str_err_check(comment, "comment")
        str_err_check(user, "user")
        
        //get recipes
        const recipeCollection = await recipes()
        //comment schema
        let newComment = {
            _id: ObjectId(),
            user: user, 
            comment: comment
        }
        let recipe =await allRecipes.getRecipeById(id)
        let oldComments = recipe.comments       //get exisiting comments
        const updatedComments ={}
        oldComments.push(newComment)        //append new comment to comments array
        updatedComments.comments = oldComments

        //update recipe collection to have new comment
        await recipeCollection.updateOne({_id : ObjectId(id)}, {$set: updatedComments})
        const insertInfo = await recipeCollection.updateOne({_id: recipeId}, {$addToSet: {_id: recipeId, comments: newComment}})
        const updated_recipe = await allRecipes.getRecipeById(id)
        return {
            _id: updated_recipe._id.toString(), 
            title: updated_recipe.title, 
            author: updated_recipe.author,
            ingredients: updated_recipe.ingredients,
            instructions: updated_recipe.instructions,
            likes: updated_recipe.likes, 
            total_likes: updated_recipe.total_likes,
            tags: updated_recipe.tags,
            comments: updated_recipe.comments,
            pictures: updated_recipe.pictures
        }

    },
    async getAll(id){
        let error_check = str_err_check(id, "id")
        if(typeof error_check === "string"){
            throw error_check
        }
        //access comments for the requested recipe
        let recipe = await allRecipes.getRecipeById(id)
        let commentList = recipe.comments
        let allComments = []

        //create objects to return with id as string
        for(i=0; recipe.comments.length; i++){
            let commentInfo = {
                _id: commentList[i]._id.toString(), 
                user: commentList[i].user, 
                comments: commentlist[i].comments
            }
            allComments.push(commentInfo)
        }
        return allComments
    }, 
    async delete(id){
        let error_check = str_err_check(id)
        if(typeof error_check != 'string'){
            throw error_check;
        }

        //get all recioes with their comments
        let totalRecipes = await allRecipes.getAllRecipes()
        let found = false
        let updatedCommentList = []
        let foundRecipeId = ""

        //search every 
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