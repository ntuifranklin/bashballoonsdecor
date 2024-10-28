const request = require("supertest");
const app = require("../../server.js");
const { assert,expect,should } = require ("chai");  

const {MySQLDBConnector} = require("../../database/models/MySQLDBConnector.js");

require("dotenv").config();

describe('Testing The URL For Each Category Web URL', async() => {

  const dbConn = MySQLDBConnector;
  const selectCategoryWebUrlSQL = "select category_weburl from categories"
  var category_weburls ;
  
  before(async() => {
    category_weburls = await dbConn.execute(selectCategoryWebUrlSQL);
  });
  it("GET /{Category Web URL}",() => {

      describe("Testing listing each items in each categories ", () => {
        category_weburls.forEach((category_weburl_object, index) => {
          var jsonObject = JSON.parse(JSON.stringify(category_weburl_object));
          var category_weburl = jsonObject.category_weburl ;
          const lowerCaseCatUrl = category_weburl.toLowerCase();
          it(`Testing of url /${lowerCaseCatUrl}`, async()=> {
            
            expect(lowerCaseCatUrl).to.not.equal(null);
            request(app).get(`/${lowerCaseCatUrl}`)
            .end(async(err, categoryUrlRequestResult) => {
              
              expect(lowerCaseCatUrl).to.not.equal(null);
              expect(lowerCaseCatUrl).to.not.equal("");
              expect(categoryUrlRequestResult.status).to.equal(200);

            }) ;
            

          });
        
        });
      });

  });
    
}) ;
