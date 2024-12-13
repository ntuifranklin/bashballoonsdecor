
/* Delete user from cache then move on */
const {USER} = require('../utilities/web_page_variables');
const {LOGIN_ROUTE} = require('../utilities/routes_constant_names');
const {deleteDataFromRedisCache, readDataFromRedisCache} = require('../middleware/redis');
const logoutPage = async (request, response) => {
    
    var user = await readDataFromRedisCache(USER);
    
    console.log(`Current user: ${JSON.stringify(user)}`);
    const emptyObject = JSON.stringify({});
     
    await deleteDataFromRedisCache(USER);
    request.locals.USER = {} ;
    return response.status(200).send(
        `You have been logged out\n<br>
        Click <a href="/${LOGIN_ROUTE}">here</a> to login again\n<br>`
    );
    


} ;

exports.logoutPage = logoutPage ;