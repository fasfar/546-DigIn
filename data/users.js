const bcrypt = require('bcrypt');
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const uuid = require('uuid/v4');
const saltRounds = 16;

let exportedMethods = {
    async getUser(id){
        if(!id || typeof(id) != 'string') throw 'You need to input a valid id';
        const userCollection = await users();
        const user = await userCollection.findOne({ _id: id });
        if (!user) throw 'User not found';
        return user;
    },

    async getUserByUsername(username){
        if(!username || typeof(username) != 'string') throw 'You need to input a valid username';
        const userCollection = await users();
        const user = await userCollection.findOne({ username: username });
        if (!user) throw 'User not found';
        return user;
    },

    async addFollower(id1, id2){
        //id1 is followed by id2
        const user = this.getUser(id1);
        let followers = user.followers;
        if(followers.includes(id2)){
            throw id2 + ' already follows ' + id1;
        }else{
            followers.push(id2);
            let obj = {
                followers: followers,
                num_followers = user.num_followers+1
            };
            return updateUser(id1, obj);
        }
    },

    async removeFollower(id1, id2){
        //id1 is unfollowed by id2
        const user = this.getUser(id1);
        let followers = user.followers;
        if(!followers.includes(id2)){
            throw id2 + ' does not follow ' + id1;
        }else{
            followers = followers.filter(function(value, index, arr){
                return value != id2;
            });
            let obj = {
                followers: followers,
                num_followers = user.num_followers-1
            };
            return updateUser(id1, obj);
        }
    },

    async follow(id1, id2){
        //id1 follows id2
        const user = this.getUser(id1);
        let users_following = user.users_following;
        if(users_following.includes(id2)){
            throw id1 + ' already follows ' + id2;
        }else{
            users_following.push(id2);
            let obj = {
                users_following: users_following,
                num_following = user.num_following+1
            };
            return updateUser(id1, obj);
        }
    },

    async unFollow(id1, id2){
        //id1 unfollows id2
        const user = this.getUser(id1);
        let users_following = user.users_following;
        if(!users_following.includes(id2)){
            throw id1 + ' does not follow ' + id2;
        }else{
            users_following = users_following.filter(function(value, index, arr){
                return value != id2;
            });
            let obj = {
                users_following: users_following,
                num_following = user.num_following-1
            };
            return updateUser(id1, obj);
        }
    },

    async addTag(id, tag){
        const user = this.getUser(id);
        let tags = user.tags_following;
        if(tags.includes(tag)){
            throw 'Already following tag ' + tag;
        }else{
            tags.push(tag);
            let obj = {
                tags_following = tags
            }
            return updatedUser(id, obj);
        }
    },

    async removeTag(id, tag){
        const user = this.getUser(id);
        let tags = user.tags_following;
        if(!tags.includes(tag)){
            throw 'Tag not followed'
        }else{
            tags = tags.filter(function(value, index, arr){
                return value != tag;
            });
            let obj = {
                tags_following = tags
            }
            return updatedUser(id, obj);
        }
    },

    async saveRecipe(id, recipeId){
        //new saved recipe
        const user = this.getUser(id);
        let recipes = user.recipes_saved;
        if(recipes.includes(recipeId)){
            throw 'recipe already followed';
        }else{
            recipes.push(recipeId);
            let obj = {
                recipes_saved = recipes
            };
            return this.updateUser(id, obj);
        }
    },

    async removeRecipe(id, recipeId){
        //remove from saved recipes
        const user = this.getUser(id);
        let recipes = user.recipes_saved;
        if(!recipes.includes(recipeId)){
            throw 'recipe not followed';
        }else{
            recipes = recipes.filter(function(value, index, arr){
                return value != recipeId;
            });
            let obj = {
                recipes_saved = recipes
            };
            return this.updateUser(id, obj);
        }
    },

    async addRecipe(id, recipeId){
        //adds to own recipes
        const user = this.getUser(id);
        let recipes = user.own_recipes;
        if(recipes.includes(recipeId)){
            throw 'recipe already made';
        }else{
            recipes.push(recipeId);
            let obj = {
                own_recipes = recipes
            };
            return this.updateUser(id, obj);
        }
    },

    async deleteRecipe(id, recipeId){
        //remove from own recipes
        const user = this.getUser(id);
        let recipes = user.own_recipes;
        if(!recipes.includes(recipeId)){
            throw 'recipe not followed';
        }else{
            recipes = recipes.filter(function(value, index, arr){
                return value != recipeId;
            });
            let obj = {
                own_recipes = recipes
            };
            return this.updateUser(id, obj);
        }
    },

    async updateUser(id, newUser){
        if(!id || typeof(id) != 'string') throw 'You need to input a valid id';
        let user = getUser(id);
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
        if(newUser.name && typeof(newUser.name) == 'string'){
            updatedUser.name = newUser.name;
        }
        if(newUser.username && typeof(newUser.username) == 'string'){
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
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: id },
            { $set: updatedUser }
          );
          if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Update failed';
      
          return await this.getUser(id);
    },

    async addUser(name,username,password,email,profile_picture){
        const userCollection = await user();
        if(!name || typeof(name) != 'string'){
            throw 'user must input valid name';
        }
        if(!username || typeof(username) != 'string'){
            throw 'user must input valid username';
        }
        if(!password || typeof(password) != 'password'){
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
            _id: uuid(),
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
    },

    async removeUser(id) {
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
};

module.exports = exportedMethods;
