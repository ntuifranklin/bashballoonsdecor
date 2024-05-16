const request = require("supertest");
const app = require("../../server.js");
const { assert,expect,should } = require ("chai");  
const cheerio = require("cheerio");
const { faker } = require('@faker-js/faker');

const {VALID_EMAIL_REGEXP, MAX_EMAIL_ADDR_LENGTH,isEmailValid} = require('../../utilities/email');
const {MAX_BUFFER_SIZE} = require('../../utilities/Fisl');

require("dotenv").config();

describe(`POST /contact`, () => {

  it("Testing submitting the contact from with good email, but lengthy one",async() => {
    
    //To submit a form, we need the csrf token
    request(app).get(`/contact`)
    .end(async (err,result) => {
      expect(result.status).to.equal(200);
      
      const $ = cheerio.load(result.text);
      const csrf = $("[name=_csrf]") ;
      /* We will send data with size greater than what is expected */
      const name = faker.string.alphanumeric(MAX_EMAIL_ADDR_LENGTH + 30); //considering the @, then domain, then dot, then extensions 
      const email = faker.internet.email({
          firstName: name,
          allowSpecialCharacters: false,
      });
      const comment = faker.string.alphanumeric(MAX_BUFFER_SIZE + 1);
      const phone = faker.phone.number();
      request(app)
      .post(`/contact`)
      .send({
          _csrf:csrf,
          name:name,
          email:email,
          commment:comment,
          phone:phone
      }).end(async(err, contactFormResult) => {
          expect(contactFormResult.status).to.not.equal(200);
          expect(contactFormResult.status).to.equal(400);
      });
    });  
  });
}) ;
