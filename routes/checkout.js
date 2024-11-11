const express = require('express');
const router = express.Router();
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const {checkCheckoutForm} = require('../middleware/checkoutFormMiddleware');
const {checkoutFormDataFormatValidator} = require('../middleware/checkoutFormValidation');
const {checkoutFormPost, showCheckoutPage} = require('../controllers/checkoutController');
module.exports = () => {
    
    router.get('/', csrfProtection, showCheckoutPage);
    router.post('/',csrfProtection,checkoutFormDataFormatValidator, checkCheckoutForm, checkoutFormPost);

     
    return router;
};

