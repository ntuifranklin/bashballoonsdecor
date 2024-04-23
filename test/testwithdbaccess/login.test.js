const request = require("supertest");
const app = require("../../server.js");
const { assert,expect,should } = require ("chai");  

const {MySQLDBConnector,defaultMySQLDBConnectorConfig} = require("../../database/models/MySQLDBConnector.js");

require("dotenv").config();

describe('GET /login', () => {
 
  const email = process.env.ADMIN_USER_EMAIL;
  const password = process.env.ADMIN_USER_PASSWORD;
  it("Testing the login url",async() => {
      const result = await request(app).get(`/login`) ;
      expect(result.status).to.equal(200);  
      const html = result.body;
      const csrf = html._csrf ;
      request(app)
        .post('/login')
        .send({
          _csrf: csrf,
          email:email,
          password:password
        }).expect((loginResult)=>{
          console.log(`${loginResult}`);
          assert.notEqual(null,loginResult);
          expect(loginResult.status).to.equal(200);
        });
  });
    
}) ;
