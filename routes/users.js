const express = require('express');
const router = express.Router();
const data = require('../data');
const recipeData = data.recipes;

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
})

router.get('/private',async (req, res) => {

});

/*
*TODO: Implement Users route functions. These functions will dictate how are data functions are accessed.*

    ROUTES NEEDED:
    Landing Page: Login/Sign up for account - GET / (users will act as our root directory aka users/ = / )
    User Profile Page: GET /:id (users/:id)
    User Profile Creation Form: GET users/createUser

*/