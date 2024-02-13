const express = require('express');
const router = express.Router();

var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true })

module.exports = () => { 
       
    router.get('/', csrfProtection, (request, response) => {
        
        request.session.destroy(err => {
            if (err) {
                console.log(`Error destroying session: ${err}`);
                return response.status(500).send(`Error destroying session`);
            }
            
            response.clearCookie(process.env.SESSION_NAME);
           
            response.status(200).send(
                `You have been logged out\n<br>
                Click <a href="/login">here</a> to login again\n<br>`
            );
        
        }) ;
        
        //return response.status(200).send(`You have been logged out`);
        
    });

    return router;
};


