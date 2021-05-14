const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users
const recipeData = data.recipes;
const bcrypt = require('bcryptjs');

router.get('/', async (req, res) => {
    if(req.session.user){
        return res.redirect('/private');
    }
    else {
        if(req.session.error){
            res.status(401).render("users/login", {error: req.session.error.toString()});
        }
        else res.render("users/login");
    }
});

router.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if(!username || !password) {
        req.session.error = "401: Invalid Login Credentials";
        return res.redirect('/');
    }
    try{
        let thisUser = await userData.getUserByUsername(username);
        let match = await bcrypt.compare(password, thisUser['password']);
        if(match){
            req.session.user = thisUser;
            return res.redirect('/private');
        }
        else{
            req.session.error = "401: Invalid Login Credentials"; 
            return res.redirect('/');
        }
    }
    catch(e){
        console.log(e.toString())
        return res.redirect('/');
    }
})

router.get('/private', async (req, res) => {
    if(req.session.user) {
        let userRecipes = await recipeData.getRecipeByAuthor(req.session.user.username)
        for(recipe of userRecipes){
            console.log(recipe.title);
        }
        req.session.user = await userData.getUser(req.session.user._id);
        return res.render("users/userProfile", {user: req.session.user, recipes: userRecipes});
    }
    else{
        req.session.error = "401: Unauthorized User";
        res.redirect("/")
    }
});

router.get('/allUsers/', async (req, res) => {
    if(req.session.user){
        let allUsers = await userData.getAllUsers();
        res.render("users/allUsers", {users: allUsers});
    }
    else{
        req.session.error = "401: Unauthorized User";
        res.redirect("/")
    }
});

router.get('/createUser', async (req, res) => {
    if(req.session.user){
        return res.redirect('/private');
    }
    else res.render('users/createUser');
});

router.post('/createUser', async (req, res) => {
    let newUser = req.body;
    try{
        let thisUser = await userData.addUser(newUser.name, newUser.username, newUser.password, newUser.email, newUser.profile_picture);
        req.session.user = thisUser;
        return res.redirect('/private');
    }
    catch (e){
        console.log(e.toString());
    }
});

router.get('/otherUser/:id', async(req, res) => {
    if(req.session.user){
        try{
            let otherUser = await userData.getUser(req.params.id);
            if(req.session.user._id == req.params.id){
                return res.redirect('/private');
            }else{
                if(await userData.isFollowing(req.session.user._id,req.params.id)){
                    res.render('users/otherUser', {user: otherUser, isFollowing: true});
                }
                else{
                    res.render('users/otherUser', {user: otherUser})
                }
            }
        }
        catch(e){
            req.session.error = "User not found";
        }
    }
    else{
        req.session.error = "Login to continue"
        res.redirect('/')
    }
});

router.get('/logout', async (req, res) => {
    req.session.destroy();
    res.redirect('/')
});

router.patch('/follow/:id', async (req, res) => {
    //the :id request parameter corresponds to the followed's id. 
    //The following user's id obtained from session cookie
    if(req.session.user){
        if(!await userData.isFollowing(req.session.user._id,req.params.id)){
            try{
                await userData.follow(req.session.user._id,req.params.id); //session user follows route user
                await userData.addFollower(req.params.id,req.session.user._id); //route user followed by session user
                console.log(await userData.getUser(req.session.user._id))
                console.log(await userData.getUser(req.params.id))
                res.redirect('/otherUser/' + req.params.id)
            }
            catch (e){
                console.log(e.toString());
            }
        }
        else{
            try{
                await userData.unFollow(req.session.user._id,req.params.id); //session user unfollows route user
                await userData.removeFollower(req.params.id,req.session.user._id); //route user unfollowed by session user
                console.log(await userData.getUser(req.session.user._id))
                console.log(await userData.getUser(req.params.id))
                res.redirect('/otherUser/' + req.params.id)
            }
            catch (e){
                console.log(e.toString());
            }
        }
    }
    else{
        req.session.error = "401: Unauthorized User"
        res.redirect('/');
    }
});

router.get('/followers', async (req, res) => {
    if(req.session.user){
        let userFollowers = await userData.getFollowers(req.session.user._id);
        console.log(userFollowers)
        res.render('users/followers', {followers: userFollowers});
    }
    else{
        req.session.error = "401: Unauthorized User"
        res.redirect('/');
    }
});

router.get('/following', async (req, res) => {
    if(req.session.user){
        let usersFollowing = await userData.getUsersFollowing(req.session.user._id);
        res.render('users/following', {following: usersFollowing});
    }
    else{
        req.session.error = "401: Unauthorized User"
        res.redirect('/');
    }
});

router.patch('/unfollow/:id', async (req, res) => {
    //the :id request parameter corresponds to the unfollowed's id. 
    //The unfollowing user's id obtained from session cookie
    if(req.session.user){
        let followers = await userData.getUsersFollowing(req.session.user._id);
        res.render('users/followers', {followers: followers});
    }
    else{
        req.session.error = "401: Unauthorized User"
        res.redirect('/');
    }
});

router.patch('/saveRecipe/:id', async (req, res) => {
    //the :id request parameter corresponds to the recipe's id. 
    //User's id obtained from session cookie
    if(req.session.user){
        userData.saveRecipe(req.session.user._id, req.params.id)
    }
    else{
        req.session.error = "401: Unauthorized User"
        res.redirect('/');
    }
});

router.patch('/removeRecipe/:id', async (req, res) => {
    //the :id request parameter corresponds to the recipe's id. 
    //User's id obtained from session cookie
    if(req.session.user){
        userData.saveRecipe(req.session.user._id, req.params.id)
    }
    else{
        req.session.error = "401: Unauthorized User"
        res.redirect('/');
    }
});

router.get('/editUser', async(req, res) => {
    if(req.session.user){
        return res.render('users/editUser', {user: req.session.user})
    }
    else{
        req.session.error = "401: Unauthorized User"
        res.redirect('/');
    }
})



router.patch('/editUser', async (req, res) => {
    if(req.session.user){
        let newUser = req.body;
        try{
            let updatedUser = await userData.updateUser(req.session.user._id, newUser);
            req.session.user = updatedUser;
            res.redirect('/private');
        }
        catch (e){
            console.log(e.toString());
        }
    }
    else{
        req.session.error = "401: Unauthorized User; cannot update User info"
        res.redirect('/');
    }
});

router.get('/feed', async (req, res) => {
    if(req.session.user){
        try{
            let user = req.session.user;
            let feed = await userData.getFeed(user._id);
            res.render('users/feed', {feed: feed});

        }
        catch (e){
            console.log(e.toString());
        }
    }
    else{
        req.session.error = "401: Unauthorized User; cannot update User info"
        res.redirect('/');
    }
});

router.get('/tags', async (req, res) =>{
    if(req.session.user){
        try{
            let user = req.session.user;
            let tags = await userData.getTags(user._id);
            res.render('users/tags', {tags: tags});

        }
        catch (e){
            console.log(e.toString());
        }
    }
    else{
        req.session.error = "401: Unauthorized User; cannot update User info"
        res.redirect('/');
    }
});

router.post('/tags/:tag', async (req, res) =>{
    if(req.session.user){
        try{
            console.log(req.params.tag);
            let user = req.session.user;
            let tag = req.params.tag;
            let FollowedTag = await userData.addTag(user._id, tag)
            res.send(tag);

        }
        catch (e){
            console.log(e.toString());
        }
    }
    else{
        req.session.error = "401: Unauthorized User; cannot update User info"
        res.redirect('/');
    }
});

module.exports = router;

/*
*TODO: Implement Users route functions. These functions will dictate how are data functions are accessed.*

    ROUTES NEEDED:
    Landing Page: Login/Sign up for account - GET / (users will act as our root directory aka users/ = / )
    User Profile Page: GET /:id (users/:id)
    User Profile Creation Form: GET users/createUser

*/