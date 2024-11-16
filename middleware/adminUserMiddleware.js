
const {ADMIN_ROUTE,LOGIN_ROUTE} = require('../utilities/routes_constant_names');
const {readDataFromRedisCache} = require('./redis');
const verifyAdminUserisLoggedIn = async(request, response, next) => {
    

    // the variable name used to store the user's cart information
    const key = request.locals.LOGGEDIN_USER_VARIABLE_NAME;
    // if there is some cached data, retrieve it and return 
    
    //The user below was saved as a string
    var user = await readDataFromRedisCache(key);

    
    //console.log(`Current user read from cache in middleware in ${__filename}: ${JSON.stringify(user)}`);

    //compare it to an empty string object
    const emptyObject = JSON.stringify({});
    
    if (!user || user === emptyObject) {
        
        return response.status(200).redirect(`/${LOGIN_ROUTE}`);
        ;
    } ;
    //user = await JSON.parse(user);
    request.locals.USER = user ;
    next();
} ;
exports.verifyAdminUserisLoggedIn = verifyAdminUserisLoggedIn ;

const redirectUserToAdminDashboardIfLoggedIn = async(request, response, next) => {
    
    // the variable name used to store the user's cart information
    const key = request.locals.LOGGEDIN_USER_VARIABLE_NAME;
    // if there is some cached data, retrieve it and return it
    var user = await readDataFromRedisCache(key);
    //var user = request.locals.USER;
    
    //console.log(`Current user read from cache in middleware in ${__filename}: ${JSON.stringify(user)}`);
    const emptyObject = JSON.stringify({});
    
    if (user && user !== emptyObject) {
        request.locals.USER = user; ;
        return response.status(200).redirect(`/${ADMIN_ROUTE}`);
        ;
    } ;
    next();
} ;
exports.redirectUserToAdminDashboardIfLoggedIn = redirectUserToAdminDashboardIfLoggedIn ;