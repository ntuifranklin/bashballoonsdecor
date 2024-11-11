const { body, validationResult} = require('express-validator');
const {OTP_CODE_SIZE} = require('../utilities/functions');
const verifyOTPFormValidation = [
    body('user_email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please enter a valid email address.'),
    body('otp')
        .isLength({ min: 1, max:OTP_CODE_SIZE })
        .isNumeric()
        .withMessage('Please enter the One Time Password you received'),
    
    (request, response, next) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        next();
    },
    
];

exports.verifyOTPFormValidation = verifyOTPFormValidation ;