
/* Delete user from cache then move on */
const {USER} = require('../utilities/web_page_variables');
const {LOGIN_ROUTE} = require('../utilities/routes_constant_names');
const {deleteDataFromRedisCache} = require('../middleware/redis');
const logoutPage = async (request, response) => {

    var app_cache = request.locals.app_cache ;
    
    var userCart = request.locals.USER_CART ;
    var user = request.locals.USER;
    userCart = await JSON.parse(JSON.stringify(userCart));
    user = JSON.parse(JSON.stringify(user));
    if (user && user != {}) {
        const userDataString =  JSON.stringify(user);
        await deleteDataFromRedisCache(userDataString);
        
        response.status(200).send(
            `You have been logged out\n<br>
            Click <a href="/${LOGIN_ROUTE}">here</a> to login again\n<br>`
        );
    } else {
        response.redirect('/');
    }
    


} ;

exports.logoutPage = logoutPage ;