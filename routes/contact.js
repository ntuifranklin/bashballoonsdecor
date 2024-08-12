const express = require('express');

const router = express.Router();
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });

const {
    contactFormValidation
} = require('../middleware/contactFormMiddleWare');

const {
    validateContactForm
} = require('../middleware/contactFormValidator');
const {
    contactPage,
    contactFormPost
} = require('../controllers/contactPageController');

module.exports = () => { 
    router.get('/', csrfProtection, contactPage);
    router.post('/', csrfProtection, contactFormValidation, validateContactForm,contactFormPost);
    return router;
};

