const express = require('express');
const router = express.Router();

var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });

const {f404Page} = require('../controllers/indexController');


module.exports = () => { 
    
    router.get('/', csrfProtection, f404Page);
     


    return router;
};

