
const dbConnection = require('../config/mongoConnection')
const recipes = require('./recipes')

const main = async() => {
    const db = await dbConnection()
    await db.dropDatabase()

    const bananaBread = await recipes.addRecipe("Chocolate Chip Banana Bread", "Grace Miguel", ["2 overripe Bananas", "2.5 cups flour", "2 eggs", "1/4 cup milk", "1 cup chocolate chips" ], "Preheat to 325. Mix dry ingredients. Combine with wet." )
    console.log('Done seeding database')
    await db.serverConfig.close()
}

main();