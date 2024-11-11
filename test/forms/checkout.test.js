const request = require("supertest");
const {startNewExpressServer} = require("../../server.js");
const app = startNewExpressServer();
const {expect} = require ("chai");  
const cheerio = require("cheerio");
const { faker } = require('@faker-js/faker');

const {MAX_EMAIL_ADDR_LENGTH} = require('../../utilities/email');
const {MAX_BUFFER_SIZE} = require('../../utilities/Fisl');

const {
  CHECKOUT_ROUTE
} = require('../../utilities/routes_constant_names.js');
require("dotenv").config();

describe(`POST /${CHECKOUT_ROUTE}`, () => {

  it("Testing submitting the checkout form",async() => {
    
    //To submit a form, we need the csrf token
    request(app).get(`/`)
    .end(async (err,result) => {
      expect(result.status).to.equal(200);
      
      const $ = cheerio.load(result.text);
      /* On home page  */
      const csrf = $("[name=csrf-token]") ;
      /* We will send data with size greater than what is expected */
      const name = faker.string.alphanumeric(MAX_EMAIL_ADDR_LENGTH + 30); //considering the @, then domain, then dot, then extensions 
      const email = faker.internet.email({
          firstName: name,
          allowSpecialCharacters: false,
      });
      const comment = faker.string.alphanumeric(MAX_BUFFER_SIZE + 1);
      const phone = faker.phone.number();
      request(app)
      .post(`/${CHECKOUT_ROUTE}`)
      .send({
          _csrf:csrf,
          name:name,
          email:email,
          commment:comment,
          phone:phone
      }).end(async(err, checkoutFormResult) => {
          expect(checkoutFormResult.status).to.not.equal(200);
          expect(checkoutFormResult.status).to.equal(400);
      });
    });  
  });
}) ;
