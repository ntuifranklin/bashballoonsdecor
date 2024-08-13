const express = require("express");
const router = express.Router();
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
require('dotenv').config();
// This is your test secret API key.
const stripe = require("stripe")(`${process.env.BASH_BALLOONS_STRIPE_SECRET_KEY}`);

module.exports = () => {

    
  router.get("/", csrfProtection, async (request, result) => {
    const session = await stripe.checkout.sessions.retrieve(request.query.session_id);
    //const customer = await stripe.customers.retrieve(session.customer);
  
    result.send(`<html><body><h1>Thanks for your order!</h1></body></html>`);
  });

  return router ;
};


