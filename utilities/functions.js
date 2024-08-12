require('dotenv').config();


/* 
    This function returns : true, false, or null
    If it returns null, then the folder detected was 
    neither testing nor production
*/
function isTestEnvironment(root_dir=new String(__dirname)) {
   
    const current_dir = root_dir;
    const CURRENT_ENV = new String(process.env.NODE_ENV);
    const PROD_ENV = "production";
    var isTesting = null ;
    if ( CURRENT_ENV == PROD_ENV ) {
        isTesting = false ;
    } else {
        isTesting = true ;
    }

    return isTesting ;
} ;

exports.isTestEnvironment = isTestEnvironment ;


function isTestEnvUpgraded(current_dir=new String(__dirname)) {
    return isTestEnvironment(root_dir=current_dir) ;
} ;
exports.isTestEnvUpgraded = isTestEnvUpgraded ;

const VALID_MESSAGE_REGEXP = /^[a-zA-Z0-9_.\, ]+$/ ;
exports.VALID_MESSAGE_REGEXP = VALID_MESSAGE_REGEXP ;

const SHELL_AND_INJECTION_REGEXP=/^[\[\{\}\(\)\>\<\&\*\‘\%\|\=\?\;\[\]\$\–\#\~\!\"\%\/\:\+\`\]]+$/;
function safeAgainstSqlAndShellInjection(message="") {
    return !SHELL_AND_INJECTION_REGEXP.test(message);
} ;

exports.safeAgainstSqlAndShellInjection = safeAgainstSqlAndShellInjection ;

const OTP_CODE_SIZE = 9 ;
exports.OTP_CODE_SIZE = OTP_CODE_SIZE ;

function isValidOTPCode(code) {
    const c = new String(code);
    return (c.length == OTP_CODE_SIZE) && (/^[0-9]+$/.test(code)) ;
} ;

exports.isValidOTPCode = isValidOTPCode ;

const VALID_PHONE_REGEXP = /^[0-9\-\+]{10,15}$/ ;
exports.VALID_PHONE_REGEXP = VALID_PHONE_REGEXP;

function isValidPhoneNumber(number){
    return VALID_PHONE_REGEXP.test(number) && (new String(number)).length >= 10;
} ;
exports.isValidPhoneNumber = isValidPhoneNumber;

function isValidTextMessage(message){
    return VALID_MESSAGE_REGEXP.test(message);
};

exports.isValidTextMessage = isValidTextMessage ;

