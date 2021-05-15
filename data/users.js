const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb').ObjectId;
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const recipes = mongoCollections.recipes;
const saltRounds = 16;

const getUser = async function getUser(id){
        if(!id)
            if(!(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/))) //if id is not ObjectId, confirm it is string of ObjectId format
                throw 'You need to input a valid id';
        const userCollection = await users();
        if(typeof id === 'string') id = ObjectId(id);
        const user = await userCollection.findOne({ _id: id });
        if (!user) throw 'User not found';
        return user;
    };

const getAllUsers = async function getAllUsers(){
    const userCollection = await users()
    const userList = await userCollection.find({}).toArray()
    return userList;
}

const getUserByUsername = async function getUserByUsername(username){
        if(!username || typeof(username) != 'string') throw 'You need to input a valid username';
        const userCollection = await users();
        const user = await userCollection.findOne({ username: username });
        if (!user) return false;
        return user;
    };

const addFollower = async function addFollower(id1, id2){
        if(!id1)
            throw 'id1 is invalid';
        if(!id2)
            throw 'id2 is invalid';
        //id1 is followed by id2
        const user = await getUser(id1);
        let followers = user.followers;
        if(followers.includes(id2)){
            throw id2 + ' already follows ' + id1;
        }else{
            let new_num_following = user.num_followers + 1;
            followers.push(id2);
            let obj = {
                followers: followers,
                num_followers: new_num_following
            };
            return updateUser(id1, obj);
        }
    };

const removeFollower = async function removeFollower(id1, id2){
        //id1 is unfollowed by id2
        if(!id1)
            throw 'id1 is invalid';
        if(!id2)
            throw 'id2 is invalid';
        const user = await getUser(id1);
        let followers = user.followers;
        if(!followers.includes(id2)){
            throw id2 + ' does not follow ' + id1;
        }else{
            followers = followers.filter(function(value, index, arr){
                return value != id2;
            });
            let new_num_followers = user.num_followers - 1;
            let obj = {
                followers: followers,
                num_followers: new_num_followers
            };
            return updateUser(id1, obj);
        }
    };

const follow = async function follow(id1, id2){
        //id1 follows id2
        if(!id1)
            throw 'id1 is invalid';
        if(!id2)
            throw 'id2 is invalid';
        const user = await getUser(id1);
        let users_following = user.users_following;
        if(users_following.includes(id2)){
            throw id1 + ' already follows ' + id2;
        }else{
            users_following.push(id2);
            let new_num_following = user.num_following + 1;
            let obj = {
                users_following: users_following,
                num_following: new_num_following
            };
            return updateUser(id1, obj);
        }
    };

const unFollow = async function unFollow(id1, id2){
        //id1 unfollows id2
        if(!id1)
            throw 'id1 is invalid';
        if(!id2)
            throw 'id2 is invalid';
        const user = await getUser(id1);
        let users_following = user.users_following;
        if(!users_following.includes(id2)){
            throw id1 + ' does not follow ' + id2;
        }else{
            users_following = users_following.filter(function(value, index, arr){
                return value != id2;
            });
            let new_num_following = user.num_following - 1;

            let obj = {
                users_following: users_following,
                num_following: new_num_following
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

const getUsersFollowing = async function getUsersFollowing(id){
    const user = await getUser(id);
    let users_following = user.users_following;
    let usersFollowing = [];
    for(thisUser of users_following){
        usersFollowing.push(await getUser(thisUser));
    }
    return usersFollowing;
}

const getFollowers = async function getFollowers(id){
    const user = await getUser(id);
    let followers = user.followers;
    let usersFollowers = [];
    for(thisUser of followers){
        usersFollowers.push(await getUser(thisUser));
    }
    return usersFollowers;
}

const addTag = async function addTag(id, tag){
        if(!id){
            throw 'user must be input';
        }
        if(!tag || typeof(tag) != 'string'){
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
    if(!tag || typeof(tag) != 'string'){
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
        if(!id)
            throw 'id is invalid';
        if(!recipeId)
            throw 'recipeId is invalid';
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
        if(!id)
            throw 'id is invalid';
        if(!recipeId)
            throw 'recipeId is invalid';
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

const hasRecipeSaved = async function hasRecipeSaved(id, recipeId){
    const user = await getUser(id);
    let recipes = user.recipes_saved;
    if(!recipes.includes(recipeId)){
        return false;
    }
    else return true;
}

const addRecipe = async function addRecipe(id, recipeId){
        //adds to own recipes
        if(!id)
            throw 'id is invalid';
        if(!recipeId)
            throw 'recipeId is invalid';
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
        if(!id)
            throw 'id is invalid';
        if(!recipeId)
            throw 'recipeId is invalid';
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
    if(!id)
            throw 'id is invalid';
    try{
        const user = await getUser(id);
        return user.tags_following;
    }catch(e){
        throw 'issue with get tags';
    }
}

const getFollowing = async function getFollowing(id){
    if(!id)
            throw 'id is invalid';
    try{
        const user = await getUser(id);
        return user.users_following;
    }catch(e){
        throw 'issue with get tags';
    }
}

const getFeed = async function getFeed(id){
    if(!id)
            throw 'id is invalid';
    try{
        let tags  = await getTags(id)
        let following  = await getFollowing(id);
        const recipeCollection= await recipes();
        let recipesBy = new Array();
    
        await recipeCollection.find().forEach(function(recipe){
            if((tags.filter(value => recipe.tags.includes(value)).length != 0) || following.includes(recipe.author_id.toString())){
                recipesBy.push(recipe);
            }
        });
        recipesBy.reverse();
        return recipesBy;

    }catch(e){
        throw 'issue with get feed';
    }
}

const updateUser = async function updateUser(id, newUser){
        if(!id)
            if(!(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/))) //if id is not ObjectId, confirm it is string of ObjectId format
                throw 'You need to input a valid id';
        let user = await getUser(id);
        let updatedUser = {
            name: user.name,
            username: user.username,
            password: user.password,
            email: user.email,
            users_following: user.users_following,
            tags_following: user.tags_following,
            recipes_saved: user.recipes_saved,
            own_recipes: user.own_recipes,
            followers: user.followers,
            num_followers: user.num_followers,
            num_following: user.num_following
        };
        if(newUser.name && typeof(newUser.name) == 'string'){
            updatedUser.name = newUser.name;
        }
        if(newUser.username && typeof(newUser.username) == 'string'){
            const someUser = await getUserByUsername(newUser.username);
            if(someUser){
                throw 'Username already taken';
            }

            const recipeCollection = await recipes()
            rlist = await recipeCollection.find({'author': user.username}).toArray()
            let i;
            for(i = 0; i< rlist.length; i++){
                let obj = ObjectId(rlist[i]._id);
                await recipeCollection.updateOne({_id: obj}, {$set: {author : newUser.username}});
            }
            updatedUser.username = newUser.username;
        }
        if(newUser.password && typeof(newUser.password) == 'string'){
            updatedUser.password = await bcrypt.hash(newUser.password, saltRounds);
        }
        if(newUser.email && typeof(newUser.email) == 'string'){
            updatedUser.email = newUser.email;
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
        if(newUser.num_followers != null && typeof(newUser.num_followers) == 'number'){

            updatedUser.num_followers = newUser.num_followers;
        }
        if(newUser.num_following != null && typeof(newUser.num_following) == 'number'){

            updatedUser.num_following = newUser.num_following;
        }
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: ObjectId(id) },
            { $set: updatedUser }
          );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Update failed';
      
        return await getUser(id);
    }

const addUser = async function addUser(name,username,password,email){
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
        let newUser = {
            _id: new ObjectId(),
            name: name,
            username: username,
            password: await bcrypt.hash(password, saltRounds),
            email: email,
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
    getAllUsers,
    addFollower,
    follow,
    addRecipe,
    hasRecipeSaved,
    addTag,
    deleteRecipe,
    removeFollower,
    unFollow,
    isFollowing,
    getUsersFollowing,
    getFollowers,
    removeRecipe,
    removeTag,
    removeUser,
    updateUser,
    saveRecipe,
    getTags,
    getFollowing, 
    getFeed
}
