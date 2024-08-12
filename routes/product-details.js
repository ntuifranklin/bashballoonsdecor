const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const {viewProductDetailsPage} = require('../controllers/productDetailsController');
module.exports = () => { 
  
    router.get('/:category_webid',  csrfProtection, viewProductDetailsPage);
    return router;
};
