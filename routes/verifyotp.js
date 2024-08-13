const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true }) ;
const {verifyOTPFormValidation} = require('../middleware/otpMiddleware');
const { verifyPagePost } = require('../controllers/verifyOtpController');
module.exports = () => { 
    
    
    
    router.post('/', csrfProtection, verifyOTPFormValidation,verifyPagePost);

    return router;
};


