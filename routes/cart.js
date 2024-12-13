const express = require('express');
const router = express.Router();

var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true }) ;

require('dotenv').config();
//const {getCategoriesItems} = require('../database/controllers/database');

const {
    cartPage,
    cartPagePost,
    cartPageUpdate,
    deleteCartItemPost
} = require('../controllers/cartController');

module.exports = () => { 
    
    router.get('/', csrfProtection,cartPage);

    router.post('/', csrfProtection, cartPagePost);

    
    router.post('/changeQuantity', csrfProtection, cartPageUpdate);
    
    router.post('/deleteItem', csrfProtection, deleteCartItemPost);


    return router;
};

