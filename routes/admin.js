const express = require('express')
var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true }) ;
const router = express.Router();

const {displayAdminDashboardPage, addItemPost, updateItemPost, displayUpdateItemPage, getItemApiPost} = require('../controllers/adminController');
const {verifyAdminUserisLoggedIn} = require('../middleware/adminUserMiddleware');
const {addItemFormValidator,itemUpdateFormValidator,postItemApiBodyValidator} = require('../middleware/adminUserIsLoggedInBackendFormValidation');
module.exports = () => { 
    
    
    router.get('/', csrfProtection, verifyAdminUserisLoggedIn, displayAdminDashboardPage);

    router.post('/',csrfProtection,verifyAdminUserisLoggedIn,addItemFormValidator, addItemPost);

    /* Form that handles a post form containing a selected category_id */
    router.post('/category_items', csrfProtection, verifyAdminUserisLoggedIn, postItemApiBodyValidator, getItemApiPost);
    
    /* Form that handles an update post form for an item belonging to a category id */
    router.post('/updateitem/:category_webid',csrfProtection, verifyAdminUserisLoggedIn,itemUpdateFormValidator, updateItemPost);

    /* Form that shows/displays a form to fill to edit an item */
    router.get('/updateitem/:category_webid', csrfProtection, verifyAdminUserisLoggedIn, displayUpdateItemPage);
    return router;
};
