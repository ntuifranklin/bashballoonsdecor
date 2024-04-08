const { faker } = require('@faker-js/faker');
const e = require('express');


async function getFakeCategoriesItems () {
    return new Promise((resolve, reject) => {
        var items_array = [] ;
        var item = {} ;
        var numberOfItems = faker.number.int({ min: 10, max: 30 });
        for (var i=0; i < numberOfItems; i++) {
            item = {
                item_id: faker.string.uuid(),
                item_name: faker.commerce.productName(),
                item_description: faker.lorem.sentence(),
                category_id: faker.string.uuid(),
                category_webid: faker.string.uuid(),
                imageurl: faker.image.url(),
                quantityAvailable: faker.number.int({ min: 9999, max: 999999 }),
                unitPrice: faker.commerce.price(),
            } ;
            items_array.push(item);
        } ;
        resolve(items_array);
    });
} ;
exports.getFakeCategoriesItems = getFakeCategoriesItems;

async function getFakeEmailObject() {
    return new Promise((resolve, reject) => {
        var emailObject = {
            to: faker.internet.email(),
            subject: faker.word.sample(5),
            html: faker.word.sample(20)
        };
        resolve(emailObject);
    });
};
exports.getFakeEmailObject = getFakeEmailObject;