
const {USER} = require('../utilities/web_page_variables');
const verifyAdminUserisLoggedIn = async(request, response, next) => {
    
    var app_cache = JSON.parse(JSON.stringify(request.locals.app_cache)) ;
    if (!app_cache.has(USER) ) {
        return response.status(400).send('Go Away!!!');
        ;
    } ;
    next();
} ;
exports.verifyAdminUserisLoggedIn = verifyAdminUserisLoggedIn ;