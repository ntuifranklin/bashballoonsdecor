const express = require('express');

const router = express.Router();
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });

const {
    validateContactForm
} = require('../middleware/contactFormMiddleWare');

const {
    contactValidator
} = require('../middleware/contactFormValidation');

const {
    contactPage,
    contactFormPost
} = require('../controllers/contactPageController');

module.exports = () => { 
    router.get('/', csrfProtection, contactPage);
    router.post('/', csrfProtection, contactValidator,validateContactForm ,contactFormPost);
    return router;
};

