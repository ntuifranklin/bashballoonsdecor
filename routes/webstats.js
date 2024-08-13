const express = require('express') ;
var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true }) ;
const router = express.Router();


module.exports = () => {
    router.get('/',csrfProtection, async (request, response) => {
        var app_cache = request.locals.app_cache ;
        var app_stats = await app_cache.getStats();
        app_stats = await JSON.parse(JSON.stringify(app_stats));
        response.status(200).json(app_stats);
    });

    return router ;
}