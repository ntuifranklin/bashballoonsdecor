const express = require('express');
const { decode,encode } = require('html-entities');

const {Email} = require('../utilities/email');

const {
    CATEGORIES_TABLE,
    USER_CART,
    USER,
    IMG_DIR_FOR_WEB
} = require('../utilities/web_page_variables');



const contactPage = async(request, response) => { 
    
    var userCart = {} ;
    var app_cache = request.locals.app_cache ;   
    const categories = await app_cache.get(CATEGORIES_TABLE);
         
    var userCart = {} ;
    var user = {} ;
    if (app_cache.has(USER))
        user = await app_cache.get(USER) ;

    if (app_cache.has(USER_CART))
        userCart = await app_cache.get(USER_CART);

    response.render('layout', { 
        pageTitle: 'Contact Us', 
        template: 'contact',
        csrfToken: request.csrfToken(),
        userCart: userCart,
        IMG_DIR_FOR_WEB :IMG_DIR_FOR_WEB,
        user:user,
        categories: categories,
        decode:decode,
        encode:encode,
    });
}
    
const contactFormPost = (request, response) => {    
    
    /* Process form */
    const name = new String(request.body.name);
    const email = new String(request.body.email);
    const comment = new String(request.body.comment);
    const phone = new String(request.body.phone);

    /* send the email */
    var emailSender = new Email();
    const emailObject = {
        to: process.env.BCC_ORDER_EMAIL,
        subject: `Contact form from ${name} with email: ${email}`,
        html: `
        Customer Details : <br/>\n
        Full Name : ${name} <br/>\n
        Email Address : ${email} <br/>\n
        Phone : ${phone} <br/>\n
        Message: ${comment}<br/>\n`,
    } ;
    emailSender.sendEmail(emailObject.to, emailObject.subject, emailObject.html).
    then((result) => {
        console.log(`Email sent: ${result}`);
        response.status(200).send(`Message sent successfully`);
    
    }).
    catch((err) => {
        console.log(`Error occured sending email: ${err}`);
        response.status(400).send(`An Error Occured while sending the email.`);
        
    });
    
} ;

module.exports = {
    contactPage,
    contactFormPost

};