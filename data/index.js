const userData = require('./users')
const recipeData = require('./recipes')
const commentsData = require('./comments')
const likesData = require('./likes')

module.exports = {
    users: userData,
    recipes: recipeData,
    comments: commentsData,
    likes: likesData
}
