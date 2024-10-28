const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const {viewRentalItemDetailsPage} = require('../controllers/rentalItemDetailsController');
module.exports = () => { 
  
    router.get('/:category_webid',  csrfProtection, viewRentalItemDetailsPage);
    return router;
};
