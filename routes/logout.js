const express = require('express');
const router = express.Router();

var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true })
const {logoutPage} = require('../controllers/logoutController'); 
module.exports = () => { 
       
    router.get('/', csrfProtection, logoutPage);

    return router;
};


