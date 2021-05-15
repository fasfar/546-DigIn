const dbConnection = require('../config/mongoConnection')
const recipes = require('./recipes')
const comments = require('./comments')
const users = require('./users')

const main = async() => {
    const db = await dbConnection()
    await db.dropDatabase()

    //USERS
    const user1 = await users.addUser('John Doe','john_doe_foodie','yumyumGoodFood','johnsFood@gmail.com');
    const user2 = await users.addUser('Firas Asfar','firas_food','iLikeCupcakes','fasfar@stevens.edu');
    const user3 = await users.addUser('Mike McCreesh','mike_makes_food','waterSucks123','mmcreesh@gmail.com');
    const user4 = await users.addUser('Grace Miguel','graces_goods','safeword978','gracem@aol.com');
    const user5 = await users.addUser('Suzy Shailesh','suzys_sweets','cakeisH3althy','sshailesh@cupcakes.com');
    const user6 = await users.addUser('Patrick Hill','professor_of_food','eatFood546','phill@stevens.edu');
    const user7 = await users.addUser('Luke Skywalker','galaxy_eats','1jedi','darthskid@starwars.com');
    const user8 = await users.addUser('Liz Lemon','lizs_lemons','whenLifeGivesYouLemons','ll@gmail.com');
    const user9 = await users.addUser('','john_doe_foodie','yumyumGoodFood','johnsFood@gmail.com');
    const user10 = await users.addUser('John Doe','john_doe_foodie','yumyumGoodFood','johnsFood@gmail.com');
    //RECIPES



    //COMMENTS


    //ADD LIKES



    //ADD FOLLOWERS


    //FOLLOW TAGS



    const bananaBread = await recipes.addRecipe("Chocolate Chip Banana Bread", "Grace Miguel", ["2 overripe Bananas", "2.5 cups flour", "2 eggs", "1/4 cup milk", "1 cup chocolate chips" ], "Preheat to 325. Mix dry ingredients. Combine with wet.", ["dessert"],"picture" )
    const cookies = await recipes.addRecipe("Chocolate Chip Cookies", "Grace Miguel", ["flour", "eggs", "sugar", "chocolate chips", "milk", "baking soda"], "Preheat to 375. Cook.", ["dessert"])
    const getChocolate = await recipes.getRecipeByIngredients(["chocolate chips"])
    const comment = await comments.createComment(bananaBread._id, "grace", "this recipe is great")
    const getTag = await recipes.getRecipeByTag("dessert")
    // console.log(bananaBread)
    // console.log(comment)
    // const comment1 = await recipes.addCommentToRecipe(bananaBread._id, comment._id)
    const comment2 = await comments.createComment(bananaBread._id, "grace", "it's sooo moist")
    console.log(comment2._id)
    console.log(bananaBread._id)
    let id = bananaBread._id
    const allCom = await comments.getAll(id)
    //const removecom = await comments.remove(comment._id)
  

    // const removeComment = await comments.remove(comment._id)

    // console.log(getChocolate)
    console.log('Done seeding database')

    await db.serverConfig.close()
}

main();