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
    console.log(req.body);
    if(!username || !password) {
        req.session.error = "401: Invalid Login Credentials";
        return res.redirect('/');
    }
    try{
        let thisUser = await userData.getUserByUsername(username);
        console.log(thisUser);
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
        return res.render("users/userProfile", {user: req.session.user});
    }
    else{
        req.session.error = "403: Unauthorized User";
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
    console.log(req.body);
    try{
        let thisUser = await data.users.addUser(newUser.registration_name, newUser.registration_username, newUser.registration_password, newUser.registration_email, newUser.registration_pic);
        req.session.user = thisUser;
        return res.redirect('/userProfile');
    }
    catch (e){
        console.log(e.toString());
    }
});

router.get('/userProfile', async (req, res) => {
    if(req.session.user) res.render('users/userProfile', {user: req.session.user})
})

router.get('/otherUser/:id', async(req, res) => {
    if(req.session.user){
        try{
            let otherUser = getUser(req.params.id);
            return res.render('users/otherUser', {user: otherUser})
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
module.exports = router;

/*
*TODO: Implement Users route functions. These functions will dictate how are data functions are accessed.*

    ROUTES NEEDED:
    Landing Page: Login/Sign up for account - GET / (users will act as our root directory aka users/ = / )
    User Profile Page: GET /:id (users/:id)
    User Profile Creation Form: GET users/createUser

*/