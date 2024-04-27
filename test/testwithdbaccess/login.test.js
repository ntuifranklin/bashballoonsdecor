const request = require("supertest");
const app = require("../../server.js");
const { assert,expect,should } = require ("chai");  
const cheerio = require("cheerio");

const {MySQLDBConnector} = require("../../database/models/MySQLDBConnector.js");

require("dotenv").config();

describe('GET /login', () => {
 
  const email = process.env.ADMIN_USER_EMAIL;
  const password = process.env.ADMIN_USER_PASSWORD;
  it("Testing the login url",async() => {
      const result = await request(app).get(`/login`) ;
      expect(result.status).to.equal(200);  
      const $ = cheerio.load(result.text);
      const csrf = $("[name=_csrf]") ;
      //console.log(`obtained csrf: ${csrf}`);
      request(app)
        .post('/login')
        .send({
          _csrf:csrf,
          email:email,
          password:password
        }).expect(async(loginResult) => {
          const $ = cheerio.load(loginResult.text);
          expect($).to.be.an('object');
          expect(loginResult.status).to.equal(200);
          expect($("[name=user_email]").val()).to.not.be(null);
          
          expect(loginResult.body.data).to.have.property('user_email');
          expect(loginResult.body.data).to.have.property('otp');

          /* get otp password */
      
          const dbConn = MySQLDBConnector;
          const selectOtpPassword = `select * from otp where user_email= ? 
          AND expiration_time=(select MAX(expiration_time) from otp where user_email=?)`;
          var otpData = await dbConn.execute(selectOtpPassword, [email,email]);
          var otpObject = JSON.parse(JSON.stringify(otpData));
          const otp = otpObject.otp_code ;
          /* checking that the verify otp password inserts a generated otp into the otp table */
          const uemail = otpObject.user_email ;
          expect(uemail).to.equal(email)
          const csrf2 = loginResult.body.data._csrf2;
          request(app)
            .post('/verifyotp')
            .send({
              user_email:email,
              otp:otp,
              _csrf:csrf
            }).expect((verifyOtpResult) => {

              expect(verifyOtpResult.body).to.be.an('object');
              expect(verifyOtpResult.status).to.equal(200);
            });

        })
        
     
  });
    
}) ;
