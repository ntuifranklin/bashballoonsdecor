require('dotenv').config();


/* 
    This function returns : true, false, or null
    If it returns null, then the folder detected was 
    neither testing nor production
*/
function isTestEnvironment(root_dir=new String(__dirname)) {
   
    const current_dir = root_dir;
    const PRODUCTION_ENV = new String(process.env.BBD_LOCATION);
    const TEST_ENV = new String(process.env.TEST_BBD_LOCATION);
    var isTesting = null ;
    if ( current_dir.includes(PRODUCTION_ENV) ) {
        isTesting = false ;
    } else if (current_dir.includes(TEST_ENV) ) {
        isTesting = true ;
    }

    return isTesting ;
} ;

exports.isTestEnvironment = isTestEnvironment ;

const VALID_MESSAGE_REGEXP = /^[a-zA-Z0-9_\.\- ]$/ ;
exports.VALID_MESSAGE_REGEXP = VALID_MESSAGE_REGEXP ;

function safeAgainstSqlAndShellInjection(message="") {
    return VALID_MESSAGE_REGEXP.test(message);
}

exports.safeAgainstSqlAndShellInjection = safeAgainstSqlAndShellInjection ;

const OTP_CODE_SIZE = 9 ;
exports.OTP_CODE_SIZE = OTP_CODE_SIZE ;

function isValidOTPCode(code) {
    const c = new String(code);
    return (c.length == OTP_CODE_SIZE) && (/^[0-9]$/.test(code)) ;
} ;

exports.isValidOTPCode = isValidOTPCode ;
