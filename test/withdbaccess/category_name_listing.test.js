const request = require("supertest");
const app = require("../../server.js");
const { assert,expect,should } = require ("chai");  

const {MySQLDBConnector,defaultMySQLDBConnectorConfig} = require("../../database/models/MySQLDBConnector.js");

require("dotenv").config();

describe('CategoryName', async() => {

  const dbConn = MySQLDBConnector;
  const selectCategoryNameSQL = "select category_name from categories"
  const category_names = await dbConn.execute(selectCategoryNameSQL);
  var cns = [] ;
  for (var j=0 ; j < category_names.length; j++) {
      
    //var category_name_obj = JSON.parse(JSON.stringify(category_names[j]));
   
    cns.push(category_name);

  } ;
  //console.log(JSON.stringify(cns));
  //loop through each category name and check if the url is accessble 
  category_names.forEach((category_name_object) => {
    var cat_name = JSON.parse(JSON.stringify(category_name_object)) ;
    var category_name = new String(cat_name.category_name);
    category_name = category_name.toLowerCase();
    console.log(`Before it : ${category_name}`);
    it(`Testing of url /${category_name}`, () => {
      console.log(`After entering it: ${category_name}`);
      
      expect(category_name).to.not.equal(null);
      const result = request(app).get(`/${category_name}`) ;
      expect(category_name).to.not.equal(null);
      expect(category_name).to.not.equal("");
      expect(result.status).to.equal(200);
    });   
  }) ; 
    
}) ;
