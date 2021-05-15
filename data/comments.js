const mongoCollections = require("../config/mongoCollections")
const recipes = mongoCollections.recipes
const {ObjectId} = require('mongodb');
const allRecipes = require('./recipes')
const user = require('./users');


const str_err_check = function str_err_check(str, param_name){
    if(!str){
        throw `Please provide ${param_name}`
    }
    if(typeof str != 'string'){ 
        throw `Invalid parameter: ${param_name} must be a string.`; 
    }
    if(str.trim().length === 0){
        throw `Invalid: ${param_name} is empty, it must not only have spaces.`
    }
    if(typeof str != 'string'){
        throw `Invalid: ${param_name} is not a string`
    }
    return 1
}

async function ownComment(recipe_id, user_id){
    let recipe = await allRecipes.getRecipeById(recipe_id);
    let comments = recipe.comments;
    let newCommentList = [];

    for(let i = 0; i < comments.length; i++){
        let newComment = {
            _id: comments[i]._id,
            user: comments[i].user, 
            user_id: comments[i].user_id,
            comment: comments[i].comment,
            recipeId: comments[i].recipeId,
            own_comment: false
        }
        if(comments[i].user_id === user_id){
            newComment.own_comment = true;
        }
        newCommentList.push(newComment);

    }

    return newCommentList;
}
 
async function createComment(recipeId, user, user_id, comment){
    //str_err_check(recipeId, "id")
    str_err_check(comment, "comment")
    str_err_check(user, "user")
    
    //get recipes
    const recipeCollection = await recipes()
    //comment schema
    let newComment = {
        _id: ObjectId(),
        user: user, 
        user_id: user_id,
        comment: comment,
        recipeId: recipeId
    }
    let recipe =await allRecipes.getRecipeById(recipeId)
    let oldComments = recipe.comments       //get exisiting comments
    const updatedComments ={}
    oldComments.push(newComment)        //append new comment to comments array
    updatedComments.comments = oldComments

    //update recipe collection to have new comment
    await recipeCollection.updateOne({_id : ObjectId(recipeId)}, {$set: updatedComments})
    const updated_recipe = await allRecipes.getRecipeById(recipeId)
    return {
        // _id: updated_recipe._id.toString(), 
        // title: updated_recipe.title, 
        // author: updated_recipe.author,
        // ingredients: updated_recipe.ingredients,
        // instructions: updated_recipe.instructions,
        // likes: updated_recipe.likes, 
        // total_likes: updated_recipe.total_likes,
        // tags: updated_recipe.tags,
        // comments: updated_recipe.comments,
        // pictures: updated_recipe.pictures
        _id: newComment._id,
        user: newComment.user, 
        user_id: newComment.user_id,
        comment: newComment.comment,
        recipeId: newComment.recipeId
        
    }

}
async function  getAll(id){
    //access comments for the requested recipe
    let recipe = await allRecipes.getRecipeById(id)
    let commentList = recipe.comments

    console.log(recipe)
    
    return commentList
}
    
async function getById(id){
   
    //get all recioes with their comments
    let totalRecipes = await allRecipes.getAllRecipes()

    //search every comment in every recipe to find the requested comment
    let i;
    for(i=0; i<totalRecipes.length; i++){

        let currId = totalRecipes[i]
        let currIdStr = currId._id.toString()
        let commentList = await this.getAll(currIdStr)
        let j;
        for(j=0; j< commentList.length; j++){
            if(commentList[j]._id.toString() == id){
                return commentList[j];
            }
        }
    }
    
    return "Comment not found"
}

async function remove(id){
    const strId = id.toString()
    //let error_check = str_err_check(strId, "ID")
    if(typeof error_check  === 'string'){
        throw error_check;
    }
    //get all recioes with their comments
    let totalRecipes = await allRecipes.getAllRecipes()
    let found = false
    let updatedCommentList = []
    let foundRecipeId = ""

    //search every comment in every recipe to find the requested comment
    let i;
    for(i=0; i<totalRecipes.length; i++){
        console.log("hey");

        let currId = totalRecipes[i]
        let currIdStr = currId._id.toString()
        let commentList = await this.getAll(currIdStr)
        console.log(commentList) 

        for(let j=0; j< commentList.length; j++){
            console.log(commentList[j]._id.toString())
            if(commentList[j]._id.toString() == id){
                found = true
                //delete it!
                commentList.splice(j,1)
                updatedCommentList = commentList
                foundRecipeId = currIdStr
                break
            }
        }
        if(found === true){
            console.log("successfully deleted")
            break
        }
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
    createComment, getAll, remove, ownComment, getById
}
