/*
*TODO: Implement Users data functions. These functions handle our interactions with our users data collection.*

    * getUser(id): returns a User object corresponding to the ObjectId input string.
        - error check id parameter - valid type/format
        - throw if object not found
        - return user object with fields as appropriate strings
    * updateUser(id, newUser, updateAll): update the respective parameter(s) according to the provided object. All parameters must be provided if updateAll == true.
        - 
    * addUser(name,username,password,email,users_following,tags_following,recipes_saved,profile_picture)
        - not sure if we should require/ask for users_following, tags_following, and recipes_saved parameters; 
            should we initialize them to zero, or register users by showing them some pages & tags they can start with?
        - at what level are we encrypting the password? is the encrypted password sent to this js file from a separate encrypting program/script, or will this file
          take the plaintext password input from the user, encrypt it, and then store/confirm the password locally? TBD
        -Potentially edit Users schema to include an array of all users following them?
    * removeUser(id)
        -
    * getUsersBy(criteria)
        -Allow for advanced querying? (i.e., users that contain a User in their users_following)
    

*/

const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const uuid = require('uuid/v4');

let exportedMethods = {
    async getUser(id){
        if(!id || typeof(id) != 'string') throw 'You need to input a valid id';
        const userCollection = await users();
        const user = await userCollection.findOne({ _id: id });
        if (!user) throw 'User not found';
        return user;
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
            recipes_saved: user.recipes_saved
        };
        if(newUser.name && typeof(newUser.name) == 'string'){
            updatedUser.name = newUser.name;
        }
        if(newUser.username && typeof(newUser.username) == 'string'){
            updatedUser.username = newUser.username;
        }
        if(newUser.password && typeof(newUser.password) == 'string'){
            updatedUser.password = newUser.password;
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
            password: password,
            email: email,
            profile_picture: profile_picture,
            users_following: [],
            tags_following: [],
            recipes_saved: []
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
      },

    async getUsersBy(){
        //not really sure what this method was supposed to be
    }


    //maybe add functions to add/remove from the array variables of users (users_following, tags_following, recipes_saved)
    //alter methods to include new user data -> followers, num followers, and own recipes
};

module.exports = exportedMethods;
