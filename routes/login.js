const express = require('express');
const router = express.Router();

var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true })

const {showLoginPage, loginPost} = require('../controllers/loginController');
const {loginValidator} = require('../middleware/loginFormValidation');
const {checkLoginForm} = require('../middleware/loginMiddleware');
const {verifyAdminUserisLoggedIn} = require('../middleware/adminUserMiddleware');
module.exports = () => { 
    
    
    router.get('/', csrfProtection, showLoginPage);

    
    router.post('/', csrfProtection,loginValidator,checkLoginForm, loginPost);


    return router;
};


