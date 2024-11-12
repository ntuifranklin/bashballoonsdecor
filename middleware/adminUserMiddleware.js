
const {ADMIN_ROUTE,LOGIN_ROUTE} = require('../utilities/routes_constant_names');
const verifyAdminUserisLoggedIn = async(request, response, next) => {
    

    var user = request.locals.USER;
    const stringifiedUser = JSON.stringify(user);
    user = await JSON.parse(stringifiedUser);
    //console.log(`Current user: ${JSON.stringify(user)}`);
    const emptyObject = JSON.stringify({});
    
    if (stringifiedUser == emptyObject) {
        return response.status(200).redirect(`/${LOGIN_ROUTE}`);
        ;
    } ;
    next();
} ;
exports.verifyAdminUserisLoggedIn = verifyAdminUserisLoggedIn ;

const redirectUserToAdminDashboardIfLoggedIn = async(request, response, next) => {
    

    var user = request.locals.USER;
    const stringifiedUser = JSON.stringify(user);
    user = await JSON.parse(stringifiedUser);
    //console.log(`Current user: ${JSON.stringify(user)}`);
    const emptyObject = JSON.stringify({});
    
    if (stringifiedUser && stringifiedUser !== emptyObject) {
        return response.redirect(`/${ADMIN_ROUTE}`);
        ;
    } ;
    next();
} ;
exports.redirectUserToAdminDashboardIfLoggedIn = redirectUserToAdminDashboardIfLoggedIn ;