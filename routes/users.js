const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users
const recipeData = data.recipes;
const bcrypt = require('bcryptjs');


router.get('/', async (req, res) => {
    if(req.session.user){
        res.redirect('/private');
    }
    else {
        if(req.session.error){
            res.status(401).render("users/login", {error: req.session.error.toString()});
        }
        else res.render("users/login");
    }
});

router.post('login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if(!username || !password) {
        req.session.error = "401: Invalid Login Credentials";
        res.redirect('/');
    }
    try{
        thisUser = userData.getUserByUsername(username);
        let match = await bcrypt.compare(password, thisUser["password-encryption-key"]);
        if(match){
            req.session.user = thisUser;
            res.redirect('/private');
        }
        else{
            req.session.error = "401: Invalid Login Credentials"; 
            res.redirect('/');
        }
    }
    catch(e){
        req.session.error = "401: Invalid Login Credentials";
        res.redirect('/');
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
    res.render('users/createUser');
})

module.exports = router;

/*
*TODO: Implement Users route functions. These functions will dictate how are data functions are accessed.*

    ROUTES NEEDED:
    Landing Page: Login/Sign up for account - GET / (users will act as our root directory aka users/ = / )
    User Profile Page: GET /:id (users/:id)
    User Profile Creation Form: GET users/createUser

*/