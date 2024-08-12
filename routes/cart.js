const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true }) ;
const {decode, encode} = require('html-entities');


require('dotenv').config();
const createError = require('http-errors');
//const {getCategoriesItems} = require('../database/controllers/database');

const {
    cartPage,
    cartPagePost,
    cartPageUpdate
} = require('../controllers/cartController');

module.exports = () => { 
    
    router.get('/', csrfProtection,cartPage);

    router.post('/', csrfProtection, cartPagePost);

    
    router.post('/changeQuantity', csrfProtection, cartPageUpdate);
    
    router.post('/deleteItem', csrfProtection, (request, response) => {
         
        var userCart = {} ;
        if (request.session.userCart) {
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        } else {
            response.status(400).send({ message: 'error', responseText: "You don't have a cart yet" });
            return; 
        } ;
        const itemID = new String(request.body.itemID);
        const source = new String(request.body.source);
        if (!( itemID in userCart)) {
            response.status(400).send({ message: 'error', responseText: 'Item not found' });
            return;
        } ;

         /* update cart save session */
        delete userCart[itemID] ;
        request.session.userCart = JSON.parse(JSON.stringify(userCart)) ;
        request.session.save();
        response.status(200).send({ message: 'success', responseText: `Item deleted from cart successfully` });
    });


    return router;
};

