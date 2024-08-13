const request = require("supertest");
const app = require("../../server.js");
const { assert,expect,should } = require ("chai");  

const {MySQLDBConnector} = require("../../database/models/MySQLDBConnector.js");

require("dotenv").config();

describe('Testing The URL For Each Category Name', async() => {

  const dbConn = MySQLDBConnector;
  const selectCategoryNameSQL = "select category_name from categories"
  var category_names ;
  
  before(async() => {
    category_names = await dbConn.execute(selectCategoryNameSQL);
  });
  it("GET /{Category Name}",() => {

      describe("Testing listing each items in each categories ", () => {
        category_names.forEach((category_name_object, index) => {
          var jsonObject = JSON.parse(JSON.stringify(category_name_object));
          var category_name = jsonObject.category_name ;
          const lowerCaseCatName = category_name.toLowerCase();
          it(`Testing of url /${lowerCaseCatName} of lower case category name`, async()=> {
            
            expect(lowerCaseCatName).to.not.equal(null);
            request(app).get(`/${lowerCaseCatName}`)
            .end(async(err, categoryUrlRequestResult) => {
              
              expect(lowerCaseCatName).to.not.equal(null);
              expect(lowerCaseCatName).to.not.equal("");
              expect(categoryUrlRequestResult.status).to.equal(200);

            }) ;
            

          });
          const upperCaseCatName = category_name.toUpperCase();
          
          it(`Testing of url /${upperCaseCatName} the upper case of category title ${lowerCaseCatName}`, async()=> {
            
            expect(upperCaseCatName).to.not.equal(null);
            request(app).get(`/${upperCaseCatName}`)
            .end(async(err, categoryUrlRequestResult) => {
              
              expect(upperCaseCatName).to.not.equal(null);
              expect(upperCaseCatName).to.not.equal("");
              expect(categoryUrlRequestResult.status).to.equal(200);

            }) ;
            

          });
        });
      });

  });
    
}) ;
