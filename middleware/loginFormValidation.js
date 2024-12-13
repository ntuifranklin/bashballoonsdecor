const { body, validationResult} = require('express-validator');
const {MIN_EMAIL_ADDR_LENGTH, MAX_EMAIL_ADDR_LENGTH,VALID_EMAIL_REGEXP} = require('../utilities/email');



/* This is the only email regular expression used to check emails  */
const loginValidator = [
    body('email')
        .isLength({min:MIN_EMAIL_ADDR_LENGTH, max:MAX_EMAIL_ADDR_LENGTH})
        .withMessage(`Email should be between ${MIN_EMAIL_ADDR_LENGTH}  and ${MAX_EMAIL_ADDR_LENGTH} characters.`)
        .matches(VALID_EMAIL_REGEXP)
        .withMessage('Email must be valid'),
    body('password')
        .isLength({ min: 1 })
        .withMessage('Please enter a password.'),
    (request, response, next) => {
        const errors = validationResult(request);
        const err_message = errors.array().map(i => i.msg).join('<br>');
        if (!errors.isEmpty()) {
          return response.status(400).send(`${err_message}`);
        }
        next();
    },
    
];
exports.loginValidator = loginValidator ;
