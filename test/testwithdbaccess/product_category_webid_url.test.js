const request = require("supertest");
const app = require("../../server.js");
const { assert,expect,should } = require ("chai");  

const {MySQLDBConnector} = require("../../database/models/MySQLDBConnector.js");

require("dotenv").config();

describe('Testing the URL for each Category webid ', async() => {

  const dbConn = MySQLDBConnector;
  const selectCategoryWebIDSQL = "select category_webid from category_items"
  var category_webids ;
  
  before(async() => {
    category_webids = await dbConn.execute(selectCategoryWebIDSQL);
  });
  it("Test each category webid as a url",() => {

      describe("Each Category Web ID URL Test", () => {
        category_webids.forEach((category_webid_object, index) => {
          var jsonObject = JSON.parse(JSON.stringify(category_webid_object));
          var category_webid = jsonObject.category_webid ;
          //const lowerCaseCatName = category_webid.toLowerCase();
          it(`Testing of url /product-details/${category_webid}`, async()=> {
            
            expect(category_webid).to.not.equal(null);
            request(app).get(`/product-details/${category_webid}`)
            .end(async (err,category_webid_url_page_result) => {
              
              expect(category_webid).to.not.equal(null);
              expect(category_webid).to.not.equal("");
              expect(category_webid_url_page_result.status).to.equal(200);

            }) ;

          });
        });
      });

  });
  
    
}) ;
