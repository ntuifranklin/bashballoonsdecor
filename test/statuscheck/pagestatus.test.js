const request = require("supertest");
const app = require("../../server.js");
const { assert,expect,should } = require ("chai");  


require("dotenv").config();

describe('GET /', () => {

  /* Start with checking standard pages */
  it('Home Page Should return a status 200', async() => {
    const result = await request(app).get("/") ;
    expect(result.status).to.equal(200);
  });
  
  it('Contact Page Should return a status 200', async() => {
    const result = await request(app).get("/contact") ;
    expect(result.status).to.equal(200);  
  });
  
  it('Cart Page Should return a status 200', async() => {
    const result = await request(app).get("/cart") ;
    expect(result.status).to.equal(200);  
  });
  
  it('Checkout Page Should return a status 200', async() => {
    const result = await request(app).get("/checkout") ;
    expect(result.status).to.equal(200);
      
  });
  
  it('Login Page Should return a status 200', async() => {
    const result = await request(app).get("/login") ;
    expect(result.status).to.equal(200);
      
  });

  /* 
    Then check all the category_name pages
    These are pages that list all items in a particular category by 
    its category_name
    For that, its important to 
   */
});
