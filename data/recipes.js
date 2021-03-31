/*
*TODO: Implement recipes data functions. These functions handle our interactions with our recipes data collection.*

    * getRecipe(id): returns a Recipe object corresponding to the ObjectId input string.
        - error check id parameter - valid type/format
        - throw if object not found
        - return recipe object with fields as appropriate strings
    * updateRecipe(id, newRecipe, updateAll): update the respective parameter(s) according to the provided object. All parameters must be provided if updateAll == true.
        - 
    * addRecipe(name,author, ingredients, instructions, tags, pictures)
        - we can error check the instructions input string to make sure it follows a specific format using regex that we can redesign later on
        - Initialize likes/total likes to empty array/0
    * removeRecipe(id)
        -
    * getRecipesBy(criteria)
        - search for recipes by tags, ingredients they contain, keywords, etc
        - recipes to fill feed page

*/