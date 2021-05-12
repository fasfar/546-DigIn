
const dbConnection = require('../config/mongoConnection')
const recipes = require('./recipes')
const comments = require('./comments')

const main = async() => {
    const db = await dbConnection()
    await db.dropDatabase()

    const bananaBread = await recipes.addRecipe("Chocolate Chip Banana Bread", "Grace Miguel", ["2 overripe Bananas", "2.5 cups flour", "2 eggs", "1/4 cup milk", "1 cup chocolate chips" ], "Preheat to 325. Mix dry ingredients. Combine with wet.", ["dessert"],"picture" )
    const cookies = await recipes.addRecipe("Chocolate Chip Cookies", "Grace Miguel", ["flour", "eggs", "sugar", "chocolate chips", "milk", "baking soda"], "Preheat t0 375. Cook.", ["dessert"], "picture")
    const getChocolate = await recipes.getRecipeByIngredients(["chocolate chips"])
     const comment = await comments.createComment(bananaBread._id, "grace", "this recipe is great")
    // console.log(bananaBread)
    // console.log(comment)
    // const comment1 = await recipes.addCommentToRecipe(bananaBread._id, comment._id)
    const comment2 = await comments.createComment(bananaBread._id, "grace", "it's sooo moist")
    let id = bananaBread._id
    const allCom = await comments.getAll(id)
    console.log(allCom)

    // const removeComment = await comments.remove(comment._id)

    // console.log(getChocolate)
    console.log('Done seeding database')

    await db.serverConfig.close()
}

main();