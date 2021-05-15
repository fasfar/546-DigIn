const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users
const recipeData = data.recipes;
const bcrypt = require('bcryptjs');
const xss = require('xss');

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
    const username = xss(req.body.username);
    const password = xss(req.body.password);
    if(!username || !password) {
        req.session.error = "401: Invalid Login Credentials";
        return res.redirect('/');
    }
    try{
        let thisUser = await userData.getUserByUsername(username);
        if(!thisUser){
            req.session.error = "401: Invalid Login Credentials"; 
            return res.redirect('/');
        }
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
        userRecipes.reverse();
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
    let newUser = xss(req.body);
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
            let otherUser = await userData.getUser(xss(req.params.id));
            if(req.session.user._id == xss(req.params.id)){
                return res.redirect('/private');
            }else{
                if(await userData.isFollowing(req.session.user._id,xss(req.params.id))){
                    let userRecipes = await recipeData.getRecipeByAuthor(otherUser.username);
                    userRecipes.reverse()
                    res.render('users/otherUser', {user: otherUser, isFollowing: true, recipes:userRecipes});
                }
                else{
                    let userRecipes = await recipeData.getRecipeByAuthor(otherUser.username);
                    userRecipes.reverse();
                    res.render('users/otherUser', {user: otherUser, recipes:userRecipes})
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
        if(!await userData.isFollowing(req.session.user._id,xss(req.params.id))){
            try{
                await userData.follow(req.session.user._id,xss(req.params.id)); //session user follows route user
                await userData.addFollower(xss(req.params.id),req.session.user._id); //route user followed by session user

                res.redirect('/otherUser/' + xss(req.params.id))
            }
            catch (e){
                console.log(e.toString());
            }
        }
        else{
            try{
                await userData.unFollow(req.session.user._id,xss(req.params.id)); //session user unfollows route user
                await userData.removeFollower(xss(req.params.id),req.session.user._id); //route user unfollowed by session user

                res.redirect('/otherUser/' + xss(req.params.id));
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
        if(!await userData.hasRecipeSaved(req.session.user._id,xss(req.params.id))){
            try{
                await userData.saveRecipe(req.session.user._id,xss(req.params.id)); //session user follows route user
                req.session.user = await userData.getUser(req.session.user._id);
                return res.redirect('/recipes/id/' + xss(req.params.id))
            }
            catch (e){
                console.log(e.toString());
            }
        }
        else{
            try{
                await userData.removeRecipe(req.session.user._id,xss(req.params.id)); //session user follows route user
                req.session.user = await userData.getUser(req.session.user._id);
                return res.redirect('/recipes/id/' + xss(req.params.id))
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
        let newUser = xss(req.body);
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
            let user = req.session.user;
            let tag = xss(req.params.tag);
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

router.post('/utags/:tag', async (req, res) =>{
    if(req.session.user){
        try{
            let user = req.session.user;
            let tag = xss(req.params.tag);
            let deletedTag = await userData.removeTag(user._id, tag)
            res.redirect('/tags');

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

router.get('/savedRecipes', async (req, res) =>{
    if(req.session.user){
        try{
            let user = await userData.getUser(req.session.user._id);
            let recipes = user.recipes_saved;
            let recipeList =[]
            for(let recipe of recipes){
                let obj = await recipeData.getRecipeById(recipe);
                recipeList.push(obj);
            }
            recipeList.reverse();
            res.render('users/savedRecipes', {recipes: recipeList});

        }
        catch (e){
            console.log(e.toString());
        }
    }
    else{
        req.session.error = "401: Unauthorized User; cannot get saved recipes";
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