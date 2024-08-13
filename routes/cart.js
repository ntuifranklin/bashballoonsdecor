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
    


    return router;
};

