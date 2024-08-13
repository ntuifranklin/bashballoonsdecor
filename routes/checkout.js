const express = require('express');
const router = express.Router();
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const {checkoutFormValidator} = require('../middleware/checkoutFormMiddleware');
const {checkoutValidator} = require('../middleware/checkoutFormValidation');
const {checkoutFormPost, showCheckoutPage} = require('../controllers/checkoutController');
module.exports = () => {
    router.post('/',csrfProtection,checkoutValidator, checkoutFormValidator, checkoutFormPost);

    router.get('/', csrfProtection, showCheckoutPage);
     
    return router;
};

