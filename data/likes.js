const mongoCollections = require("../config/mongoCollections")
const recipes = mongoCollections.recipes
const {ObjectId} = require('mongodb');
const allRecipes = require('./recipes')
const user = require('./users');
const e = require("express");


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
 
async function addLike(recipeId, user, user_id){
    //str_err_check(recipeId, "id")
    str_err_check(user, "user")
    
    //get recipes
    const recipeCollection = await recipes()
    //likes schema
    let newLike = {
        user: user, 
        user_id: user_id
    }
    let recipe = await allRecipes.getRecipeById(recipeId)
    let oldLikes = recipe.likes       //get exisiting likes
    let oldTotal = recipe.total_likes
    const updatedLikes = {}
    oldLikes.push(newLike)        //append new likes to likes array
    updatedLikes.likes = oldLikes
    updatedLikes.total_likes = oldTotal + 1

    //update recipe collection to have new likes
    await recipeCollection.updateOne({_id : ObjectId(recipeId)}, {$set: updatedLikes})
    const updated_recipe = await allRecipes.getRecipeById(recipeId)
    return {
        user: newLike.user, 
        user_id: newLike.user_id,      
    }

}
async function  getAll(id){
    let error_check = str_err_check(id, "id")
    if(typeof error_check === "string"){
        throw error_check
    }
    //access comments for the requested recipe
    let recipe = await allRecipes.getRecipeById(id)
    let likesList = recipe.likes
    
    return likesList
}
    
async function checkIfLiked(recipe_id, user_id){
    const recipe = await allRecipes.getRecipeById(recipe_id);
    const likes = recipe.likes;

    if(likes.map(function(e) { return e.user_id; }).indexOf(user_id) < 0){
        return false;
    }
    else{
        return true;
    }
}

async function remove(id, user_id){
    const recipe = await allRecipes.getRecipeById(id);
    const likes = recipe.likes;
    const total_likes = recipe.total_likes;

    let index = likes.map(function(e) { return e.user_id; }).indexOf(user_id);
    let updatedLikes = {};
    likes.splice(index, 1);
    updatedLikes.likes = likes;
    updatedLikes.total_likes = total_likes - 1;

    const recipeCollection = await recipes();
    await recipeCollection.updateOne({_id : ObjectId(id)}, {$set: updatedLikes});

    return true;
}

module.exports = {
    addLike, getAll, checkIfLiked, remove
}
