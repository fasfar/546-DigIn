const dbConnection = require('../config/mongoConnection')
const recipes = require('./recipes')
const comments = require('./comments')
const users = require('./users')
const likes = require('./likes')

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
    
    
    //RECIPES
    const recipe1 = await recipes.addRecipe("Spaghetti and Meatballs", "john_doe_foodie", user1._id.toString(), ["Pasta", "Ground Beef", "Garlic", "Tomato Sauce", "Italian Seasoning"], "Boil pasta for 10 minutes, Mix beef and seasoning, Combine pasta and meatballs in tomato sauce", ["Italian", "Dinner"]);
    const recipe2 = await recipes.addRecipe("Mixed Berry Smoothie", "mike_makes_food", user3._id.toString(), ["Blueberries", "Strawberries", "Banana", "Yogurt", "Mango"], "Mix together equal parts blueberries and strawberries, Dice up mango into small pieces, Combine fruit with yogurt and blend until smooth", ["Vegan", "Healthy","Meal Replacement", "Vegetarian"]);
    const recipe3 = await recipes.addRecipe("Spaghetti Squash", "firas_food", user2._id.toString(), ["Butternut Squash", "Garlic", "Salt"], "Roast the Squash for 30 minutes, Scrape the squash with a fork, Prepare pasta with garlic and seasonings", ['Vegan', "Healthy", "Dinner", "Vegetarian"]);
    const recipe4 = await recipes.addRecipe("Brownies", "suzys_sweets", user5._id.toString(), ["Cocoa Powder", "Flour", "Eggs", "Milk", "Sugar"], "Combine dry ingredients, Mix wet ingredients separately, Combine all ingredients in a baking pan, Cook at 350F for 30 minutes", ["Dessert", "Chocolate"]);
    const recipe5 = await recipes.addRecipe("Cream Puffs", 'graces_goods', user4._id.toString(), ["Puff Pastries", "Whipping Cream", "Sugar", "Powdered Sugar"], "Separate and cook puff pastries at 375F for 10 minutes, Whisk together whipping cream and sugar until peaks form, Allow puff pastries to cool, then fill with cream, Finish with powdered sugar", ["Italian", "Dessert"]);
    const recipe6 = await recipes.addRecipe("Session Cookies", "professor_of_food", user6._id.toString(), ["Express", "NPM", "Flour", "Sugar", "Chocolate Chips"], "npm install express, npm install express-session, Combine dry ingredients and Javascript in one bowl, Cook at 350F in a Node.js oven for 10 minutes, npm start", ["Chocolate", "Dessert"]);
    //COMMENTS
    const comment1 = await comments.createComment(recipe1._id, "firas_food", user2._id, "This was delicious! The whole family loved it");
    const comment2 = await comments.createComment(recipe2._id, "graces_goods", user4._id, "This made a tasty and healthy breakfast!");
    const comment3 = await comments.createComment(recipe2._id, "mike_makes_food", user3._id, "I hope you all enjoy!");
    const comment4 = await comments.createComment(recipe3._id, "suzys_sweets", user5._id, "My favorite vegetarian meal!")
    const comment5 = await comments.createComment(recipe5._id, "galaxy_eats", user7._id, "I'm taking these back to my home far, far away")
    const comment6 = await comments.createComment(recipe5._id, "professor_of_food", user6._id, "My session cookies are better!")
    const comment7 = await comments.createComment(recipe4._id, "firas_food", user2._id, "I loooove brownies!")
    const comment8 = await comments.createComment(recipe6._id, "lizs_lemons", user8._id, "This would go great with some lemons")

    //ADD LIKES
    await likes.addLike(recipe1._id,"suzys_sweets", user5._id);
    await likes.addLike(recipe2._id,"suzys_sweets", user5._id);
    await likes.addLike(recipe2._id,"firas_food", user2._id);
    await likes.addLike(recipe2._id,"mike_makes_food", user3._id);
    await likes.addLike(recipe3._id,"suzys_sweets", user5._id);
    await likes.addLike(recipe3._id,"graces_goods", user4._id);
    await likes.addLike(recipe4._id,"john_doe_foodie", user1._id);
    await likes.addLike(recipe4._id,"galaxy_eats", user7._id);
    await likes.addLike(recipe4._id,"lizs_lemons", user8._id);
    await likes.addLike(recipe4._id,"professor_of_food", user6._id);
    await likes.addLike(recipe5._id,"suzys_sweets", user5._id);

    //ADD FOLLOWERS
    await users.follow(user1._id, user2._id);
    await users.addFollower(user2._id, user1._id);
    
    await users.follow(user3._id, user2._id);
    await users.addFollower(user2._id, user3._id);
    
    await users.follow(user2._id, user1._id);
    await users.addFollower(user1._id, user2._id);
    
    await users.follow(user4._id, user1._id);
    await users.addFollower(user1._id, user4._id);
    
    await users.follow(user2._id, user4._id);
    await users.addFollower(user4._id, user2._id);
   
    await users.follow(user1._id, user4._id);
    await users.addFollower(user4._id, user1._id);
    
    await users.follow(user5._id, user6._id);
    await users.addFollower(user6._id, user5._id);
    
    await users.follow(user1._id, user5._id);
    await users.addFollower(user5._id, user1._id);
    
    await users.follow(user3._id, user6._id);
    await users.addFollower(user6._id, user3._id);
    
    await users.follow(user6._id, user7._id);
    await users.addFollower(user7._id, user6._id);
    
    await users.follow(user4._id, user6._id);
    await users.addFollower(user6._id, user4._id);

    //FOLLOW TAGS
    await users.addTag(user1._id, "Italian");

    await users.addTag(user2._id, "Vegetarian");
    await users.addTag(user2._id, "Dessert");

    await users.addTag(user3._id, "Dessert");
    await users.addTag(user3._id, "Dinner");

    await users.addTag(user4._id, "Vegan");
    await users.addTag(user4._id, "Healthy");
    await users.addTag(user4._id, "Dinner");
    await users.addTag(user4._id, "Italian");

    await users.addTag(user5._id, "Vegan");

    await users.addTag(user7._id, "Meal Replacement");
    await users.addTag(user7._id, "Chocolate");
    
    await users.addTag(user8._id, "Dessert");
    /*const bananaBread = await recipes.addRecipe("Chocolate Chip Banana Bread", "Grace Miguel", ["2 overripe Bananas", "2.5 cups flour", "2 eggs", "1/4 cup milk", "1 cup chocolate chips" ], "Preheat to 325. Mix dry ingredients. Combine with wet.", ["dessert"],"picture" )
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

    // console.log(getChocolate)*/
    console.log('Done seeding database')

    await db.serverConfig.close()
}

main();