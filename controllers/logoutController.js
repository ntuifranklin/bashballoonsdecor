
/* Delete user from cache then move on */
const {USER} = require('../utilities/web_page_variables');
const {LOGIN_ROUTE} = require('../utilities/routes_constant_names');
const logoutPage = async (request, response) => {

    var app_cache = request.locals.app_cache ;
    if (app_cache.has(USER)) {
        await app_cache.del(USER);
        
        response.status(200).send(
            `You have been logged out\n<br>
            Click <a href="/${LOGIN_ROUTE}">here</a> to login again\n<br>`
        );
    } else {
        response.redirect('/');
    }
    


} ;

exports.logoutPage = logoutPage ;