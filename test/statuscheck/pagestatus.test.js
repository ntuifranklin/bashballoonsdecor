const request = require("supertest");
const app = require("../../server.js");
const {expect} = require ("chai");

const {
  CHECKOUT_ROUTE,
  CART_ROUTE,
  CONTACT_ROUTE,
  PRODUCT_DETAILS_ROUTE,
  ADMIN_ROUTE,
  LOGIN_ROUTE,
  LOGOUT_ROUTE,
  VERIFY_OTP_ROUTE,
  F404_ROUTE,
  CREATE_PAYMENT_INTENT_ROUTE,
  SUCCESS_PAYMENT_ROUTE
} = require('../../utilities/routes_constant_names.js');


require("dotenv").config();

describe('GET /', () => {

  /* Start with checking standard pages */
  it('Home Page Should return a status 200', async() => {
    request(app).get("/")
    .end(async(err,result) =>{
      expect(result.status).to.equal(200);
    });
  });
  
  it('Contact Page Should return a status 200', async() => {
    request(app).get(`/${CONTACT_ROUTE}`)
    .end(async(err,result) => {
      expect(result.status).to.equal(200);
    });  
  });
  
  it('Cart Page Should return a status 200', async() => {
    request(app).get(`/${CART_ROUTE}`)
    .end(async(err,result) => {
      expect(result.status).to.equal(200);
    });  
  });
  
  it('Checkout Page Should return a status 200', async() => {
    request(app).get(`/${CHECKOUT_ROUTE}`)
    .end(async(err,result) => {
      expect(result.status).to.equal(200);
    });
      
  });
  
  it('Login Page Should return a status 200', async() => {
    request(app).get(`/${LOGIN_ROUTE}`)
    .end(async(err,result) => {
      expect(result.status).to.equal(200);
    });
      
  });
  
  
  it('Logout Page Should return a status 200', async() => {
    request(app).get(`/${LOGOUT_ROUTE}`)
    .end(async(err,result) => {
      expect(result.status).to.equal(200);
    });
      
  });
  
  it('Admin Page Should return a status 401 when user not logged in', async() => {
    request(app).get(`/${ADMIN_ROUTE}`)
    .end(async(err,result) => {
      expect(result.status).to.equal(401);
    });
      
  });
  
  it('Error 404 Page Should return a status 200', async() => {
    request(app).get(`/${F404_ROUTE}`)
    .end(async(err,result) => {
      expect(result.status).to.equal(200);
    });
  });

  it('Product Details Page Should redirect to F404 page and a status 200', async() => {
    request(app).get(`/${PRODUCT_DETAILS_ROUTE}`)
    .end(async(err,result) => {
      expect(result.status).to.equal(200);
    });
      
  });
  
  it('Non existent route should redirect to F404 page and a status 200', async() => {
    request(app).get(`/*`)
    .end(async(err,result) => {
      expect(result.status).to.equal(200);
    });
      
  });

 
});
