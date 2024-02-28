const {By, Builder} = require('selenium-webdriver');
const assert = require("assert");

const HOME_PAGE = 'http://www.bashballoonsrentals.com/'

  describe('Testing Adding To Cart From Index Page', function () {
    let driver;
    
    before(async function () {
      driver = await new Builder().forBrowser('firefox').build();
    });
    
    it('Test The Correct Title', async function () {
      await driver.get(`${HOME_PAGE}`);
      
      let title = await driver.getTitle();
      assert.equal("Bash Balloons Decor And Rentals | BBDR | Bash Balloons Decor And Rentals | BBDR", title);
      
      await driver.manage().setTimeouts({implicit: 500});
      
      let listOfItems = await driver.findElement(By.className('add-to-cart'));
      assert.notEqual(null, listOfItems);
      assert.notEqual(0, listOfItems.length);
      
      /*
      await textBox.sendKeys('Selenium');
      await submitButton.click();
      
      let message = await driver.findElement(By.id('message'));
      let value = await message.getText();
      assert.equal("Received!", value);
      */
    });
  
    after(async () => await driver.quit());
  });