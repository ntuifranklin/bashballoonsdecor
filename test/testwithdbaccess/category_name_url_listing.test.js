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
          it(`Testing of url /${lowerCaseCatName} `, async()=> {
            
            expect(lowerCaseCatName).to.not.equal(null);
            const result = await request(app).get(`/${lowerCaseCatName}`) ;
            expect(lowerCaseCatName).to.not.equal(null);
            expect(lowerCaseCatName).to.not.equal("");
            expect(result.status).to.equal(200);

          });
        });
      });

  });
  /*
  category_names.forEach((category_name_object) => {
    var cat_name = JSON.parse(JSON.stringify(category_name_object)) ;
    var category_name = new String(cat_name.category_name);
    category_name = category_name.toLowerCase();
    //console.log(`Before it : ${category_name}`);
    it(`Testing of url /${category_name}`, async() => {
      //console.log(`After entering it: ${category_name}`);
      
      expect(category_name).to.not.equal(null);
      const result = await request(app).get(`/${category_name}`) ;
      expect(category_name).to.not.equal(null);
      expect(category_name).to.not.equal("");
      expect(result.status).to.equal(200);
    });   
  }) ; 
  */
    
}) ;
