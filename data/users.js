const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb').ObjectId;
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const recipes = mongoCollections.recipes;
const saltRounds = 16;

const getUser = async function getUser(id){
        if(!id || !(id instanceof ObjectId))
            if(!(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/))) //if id is not ObjectId, confirm it is string of ObjectId format
                throw 'You need to input a valid id';
        const userCollection = await users();
        if(typeof id === 'string') id = ObjectId(id);
        const user = await userCollection.findOne({ _id: id });
        if (!user) throw 'User not found';
        return user;
    };

const getUserByUsername = async function getUserByUsername(username){
        if(!username || typeof(username) != 'string') throw 'You need to input a valid username';
        const userCollection = await users();
        const user = await userCollection.findOne({ username: username });
        if (!user) throw 'User not found';
        return user;
    };

const addFollower = async function addFollower(id1, id2){
        //id1 is followed by id2
        const user = await getUser(id1);
        let followers = user.followers;
        if(followers.includes(id2)){
            throw id2 + ' already follows ' + id1;
        }else{
            followers.push(id2);
            let obj = {
                followers: followers,
                num_followers: user.num_followers + 1
            };
            return updateUser(id1, obj);
        }
    };

const removeFollower = async function removeFollower(id1, id2){
        //id1 is unfollowed by id2
        const user = await getUser(id1);
        let followers = user.followers;
        if(!followers.includes(id2)){
            throw id2 + ' does not follow ' + id1;
        }else{
            followers = followers.filter(function(value, index, arr){
                return value != id2;
            });
            let obj = {
                followers: followers,
                num_followers: user.num_followers - 1
            };
            return updateUser(id1, obj);
        }
    };

const follow = async function follow(id1, id2){
        //id1 follows id2
        const user = await getUser(id1);
        let users_following = user.users_following;
        if(users_following.includes(id2)){
            throw id1 + ' already follows ' + id2;
        }else{
            users_following.push(id2);
            let obj = {
                users_following: users_following,
                num_following: user.num_following+1
            };
            return updateUser(id1, obj);
        }
    };

const unFollow = async function unFollow(id1, id2){
        //id1 unfollows id2
        const user = await getUser(id1);
        let users_following = user.users_following;
        if(!users_following.includes(id2)){
            throw id1 + ' does not follow ' + id2;
        }else{
            users_following = users_following.filter(function(value, index, arr){
                return value != id2;
            });
            let obj = {
                users_following: users_following,
                num_following: user.num_following-1
            };
            return updateUser(id1, obj);
        }
    };

const isFollowing = async function isFollowing(id1, id2){
    //returns boolean for whether id1 follows id2
    const user = await getUser(id1);
    let users_following = user.users_following;
    if(users_following.includes(id2)) return true;
    return false;
}

const addTag = async function addTag(id, tag){
        if(!id){
            throw 'user must be input';
        }
        if(!tag){
            throw 'tag must be input';
        }
        const user = await getUser(id);
        let tags = user.tags_following;
        if(tags.includes(tag)){
            throw 'Already following tag ' + tag;
        }else{
            tags.push(tag);
            let obj = {
                tags_following: tags
            }
            return await updateUser(id, obj);
        }
    };

const removeTag = async function removeTag(id, tag){
    if(!id){
        throw 'user must be input';
    }
    if(!tag){
        throw 'tag must be input';
    }
        const user = await getUser(id);
        let tags = user.tags_following;
        if(!tags.includes(tag)){
            throw 'Tag not followed'
        }else{
            tags = tags.filter(function(value, index, arr){
                return value != tag;
            });
            let obj = {
                tags_following: tags
            }
            return await updateUser(id, obj);
        }
    };

const saveRecipe = async function saveRecipe(id, recipeId){
        //new saved recipe
        const user = await getUser(id);
        let recipes = user.recipes_saved;
        if(recipes.includes(recipeId)){
            throw 'recipe already followed';
        }else{
            recipes.push(recipeId);
            let obj = {
                recipes_saved: recipes
            };
            return this.updateUser(id, obj);
        }
    };

const removeRecipe = async function removeRecipe(id, recipeId){
        //remove from saved recipes
        const user = await getUser(id);
        let recipes = user.recipes_saved;
        if(!recipes.includes(recipeId)){
            throw 'recipe not followed';
        }else{
            recipes = recipes.filter(function(value, index, arr){
                return value != recipeId;
            });
            let obj = {
                recipes_saved: recipes
            };
            return this.updateUser(id, obj);
        }
    };

const addRecipe = async function addRecipe(id, recipeId){
        //adds to own recipes
        const user = await getUser(id);
        let recipes = user.own_recipes;
        if(recipes.includes(recipeId)){
            throw 'recipe already made';
        }else{
            recipes.push(recipeId);
            let obj = {
                own_recipes: recipes
            };
            return await updateUser(id, obj);
        }
    };

const deleteRecipe = async function deleteRecipe(id, recipeId){
        //remove from own recipes
        const user = await getUser(id);
        let recipes = user.own_recipes;
        if(!recipes.includes(recipeId)){
            throw 'recipe not followed';
        }else{
            recipes = recipes.filter(function(value, index, arr){
                return value != recipeId;
            });
            let obj = {
                own_recipes: recipes
            };
            return this.updateUser(id, obj);
        }
}

const getTags = async function getTags(id){
    try{
        const user = await getUser(id);
        return user.tags_following;
    }catch(e){
        throw 'issue with get tags';
    }
}

const getFollowing = async function getFollowing(id){
    try{
        const user = await getUser(id);
        return user.users_following;
    }catch(e){
        throw 'issue with get tags';
    }
}

const getFeed = async function getFeed(id){
    try{
        let tags  = await getTags(id)
        let following  = await getFollowing(id);
        const recipeCollection= await recipes();
        let recipesBy = [];
        recipeCollection.find().forEach(function(recipe){
            if((tags.filter(value => recipe.tags.includes(value)) != []) || following.includes(recipe.author_id)){
                recipesBy.push(recipe);
            }
        });
        return recipesBy;

    }catch(e){
        throw 'issue with get feed';
    }
}

const updateUser = async function updateUser(id, newUser){
        if(!id || !(id instanceof ObjectId))
            if(!(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/))) //if id is not ObjectId, confirm it is string of ObjectId format
                throw 'You need to input a valid id';
        //console.log(newUser);
        let user = await getUser(id);
        let updatedUser = {
            name: user.name,
            username: user.username,
            password: user.password,
            email: user.email,
            profile_picture: user.profile_picture,
            users_following: user.users_following,
            tags_following: user.tags_following,
            recipes_saved: user.recipes_saved,
            own_recipes: user.own_recipes,
            followers: user.followers,
            num_followers: user.num_followers,
            num_following: user.num_following
        };
        //console.log(updatedUser);
        if(newUser.name && typeof(newUser.name) == 'string'){
            updatedUser.name = newUser.name;
        }
        if(newUser.username && typeof(newUser.username) == 'string'){
            const someUser = await getUserByUsername(username);
            if(someUser){
                throw 'Username already taken';
            }
            updatedUser.username = newUser.username;
        }
        if(newUser.password && typeof(newUser.password) == 'string'){
            updatedUser.password = await bcrypt.hash(newUser.password, saltRounds);
        }
        if(newUser.email && typeof(newUser.email) == 'string'){
            updatedUser.email = newUser.email;
        }
        if(newUser.profile_picture && typeof(newUser.profile_picture) == 'string'){
            updatedUser.name = newUser.name;
        }
        if(newUser.users_following && Array.isArray(newUser.users_following)){
            updatedUser.users_following = newUser.users_following;
        }
        if(newUser.tags_following && Array.isArray(newUser.tags_following)){
            updatedUser.tags_following = newUser.tags_following;
        }
        if(newUser.recipes_saved && Array.isArray(newUser.recipes_saved)){
            updatedUser.recipes_saved = newUser.recipes_saved;
        }
        if(newUser.own_recipes && Array.isArray(newUser.own_recipes)){
            updatedUser.own_recipes = newUser.own_recipes;
        }
        if(newUser.followers && Array.isArray(newUser.followers)){
            updatedUser.followers = newUser.followers;
        }
        if(newUser.num_followers && typeof(num_followers) == 'number'){
            updatedUser.num_followers = newUser.num_followers;
        }
        if(newUser.num_following && typeof(num_following) == 'number'){
            updatedUser.num_following = newUser.num_following;
        }
        //console.log(updatedUser);
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: ObjectId(id) },
            { $set: updatedUser }
          );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Update failed';
      
        return await getUser(id);
    }

const addUser = async function addUser(name,username,password,email,profile_picture){
        const userCollection = await users();
        if(!name || typeof(name) != 'string'){
            throw 'user must input valid name';
        }
        if(!username || typeof(username) != 'string'){
            throw 'user must input valid username';
        }
        const someUser = await getUserByUsername(username);
        if(someUser){
            throw 'Username already taken';
        }
        if(!password || typeof(password) != 'string'){
            throw 'user must input valid password';
        }
        if(!email || typeof(email) != 'string'){
            throw 'user must input valid name';
        }
        if(!profile_picture || typeof(profile_picture) != 'string'){
            throw 'user must input valid profile_picture';
            //perhaps we should change this to set it to a default profile picture if one isnt submitted
        }

        let newUser = {
            _id: new ObjectId(),
            name: name,
            username: username,
            password: await bcrypt.hash(password, saltRounds),
            email: email,
            profile_picture: profile_picture,
            tags_following: [],
            recipes_saved: [],
            own_recipes: [],
            followers: [],
            num_followers: 0,
            users_following: [],
            num_following: 0
        };
        const newInsertInformation = await userCollection.insertOne(newUser);
        if (newInsertInformation.insertedCount === 0) throw 'Insert failed!';
        return await getUser(newInsertInformation.insertedId);
}

const removeUser = async function removeUser(id) {
        if(!id || typeof(id) != 'string') throw 'You need to input a valid id';
        const userCollection = await users();
        const deletionInfo = await userCollection.removeOne({ _id: id });
        if (deletionInfo.deletedCount === 0) {
          throw `Could not delete user with id of ${id}`;
        }
        return true;
      }
    //maybe add functions to add/remove from the array variables of users (users_following, tags_following, recipes_saved)
    //alter methods to include new user data -> followers, num followers, and own recipes


module.exports = {
    addUser,
    getUser,
    getUserByUsername,
    addFollower,
    follow,
    addRecipe,
    addTag,
    deleteRecipe,
    removeFollower,
    unFollow,
    isFollowing,
    removeRecipe,
    removeTag,
    removeUser,
    updateUser,
    saveRecipe,
    getTags,
    getFollowing, 
    getFeed
}
