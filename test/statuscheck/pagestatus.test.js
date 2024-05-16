const request = require("supertest");
const app = require("../../server.js");
const { assert,expect,should } = require ("chai");  


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
    request(app).get("/contact")
    .end(async(err,result) => {
      expect(result.status).to.equal(200);
    });  
  });
  
  it('Cart Page Should return a status 200', async() => {
    request(app).get("/cart")
    .end(async(err,result) => {
      expect(result.status).to.equal(200);
    });  
  });
  
  it('Checkout Page Should return a status 200', async() => {
    request(app).get("/checkout")
    .end(async(err,result) => {
      expect(result.status).to.equal(200);
    });
      
  });
  
  it('Login Page Should return a status 200', async() => {
    request(app).get("/login")
    .end(async(err,result) => {
      expect(result.status).to.equal(200);
    });
      
  });

 
});
