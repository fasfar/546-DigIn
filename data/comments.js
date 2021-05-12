const mongoCollections = require("../config/mongoCollections")
const recipes = mongoCollections.recipes
const {ObjectId} = require('mongodb');
const allRecipes = require('./recipes')
const user = require('./users');


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


 
    async function createComment(recipeId, user, comment){
        str_err_check(recipeId, "id")
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
        let recipe =await allRecipes.getRecipeById(recipeId)
        let oldComments = recipe.comments       //get exisiting comments
        const updatedComments ={}
        oldComments.push(newComment)        //append new comment to comments array
        updatedComments.comments = oldComments

        //update recipe collection to have new comment
        await recipeCollection.updateOne({_id : ObjectId(recipeId)}, {$set: updatedComments})
        const insertInfo = await recipeCollection.updateOne({_id: recipeId}, {$addToSet: {_id: recipeId, comments: newComment}})
        const updated_recipe = await allRecipes.getRecipeById(recipeId)
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

    }
    async function  getAll(id){
        let error_check = str_err_check(id, "id")
        if(typeof error_check === "string"){
            throw error_check
        }
        //access comments for the requested recipe
        let recipe = await allRecipes.getRecipeById(id)
        let commentList = recipe.comments
      
        return commentList
    }
      

    async function remove(id){
        let error_check = str_err_check(id)
        if(typeof error_check != 'string'){
            throw error_check;
        }

        //get all recioes with their comments
        let totalRecipes = await allRecipes.getAllRecipes()
        let found = false
        let updatedCommentList = []
        let foundRecipeId = ""

        //search every comment in every recipe to find the requested comment
        for(i=0; i<totalRecipes.length; i++){
            let currId = totalRecipes[i]
            currId = currId._id.toString()
            let commentList = await this.getAll(currId) 

            for(j=0; j< commentList.length; j++){
                if(commentList[i]._id.toString() === id){
                    console.log("FOUND IT")
                    found = true
                    //delete it!
                    commentList.splice(i,1)
                    updatedCommentList = commentList
                    foundRecipeId = currId
                    break
                }
            }
            if(found === true)
            break
        }
        if(found === false){
            throw 'Comment not found'
        }
        let updatedRecipeData = {}
        updatedRecipeData.comments = updatedCommentList

        const recipeCollection = await recipes()
        await recipeCollection.updateOne({_id: ObjectId(foundRecipeId)}, {$set: updatedRecipeData})
        return {commentId: id, deleted: true}
    }

module.exports = {
    createComment, getAll, remove
}
