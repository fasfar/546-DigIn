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