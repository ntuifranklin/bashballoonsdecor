/* 

 This class contains a class
 Called File Input Size Limitter.
 The purpose is to prevent buffer over flow by limiting the 
 the size of data taken in from web forms or any other source from
 potential attackers.
 That's right attackers. I see you coming! 
 And I'm ready! 😊 
*/
const { Buffer } = require('node:buffer');
/* 
  This was checked from the describe `tableName` in 
  mysql. Specifically the customers table.
  All fields cannot be more than 255 long.
  If needs to be changed, then make sure it matches the size 
  of the field into the database where the data will be placed.
 */
const MAX_BUFFER_SIZE = 255 ; 
exports.MAX_BUFFER_SIZE = MAX_BUFFER_SIZE ;
const MAX_ITEM_NAME_SIZE = 255 ; 
exports.MAX_ITEM_NAME_SIZE = MAX_ITEM_NAME_SIZE ;
const MAX_DESCRIPTION_SIZE = 1024 ;
exports.MAX_DESCRIPTION_SIZE = MAX_DESCRIPTION_SIZE ;
const DEFAULT_BUFFER_TYPE = "utf8";
exports.DEFAULT_BUFFER_TYPE = DEFAULT_BUFFER_TYPE ;
class Fisl {
    //default size is 50
    //default type is utf8
    buffer;
    dataType;
    maxSize ;
    constructor() {
        this.maxSize = MAX_BUFFER_SIZE ;
        this.dataType = 'utf8' ;
        this.buffer = Buffer.alloc(this.maxSize,"", this.dataType);
        this.overLoadConstructor(this.maxSize,"", this.dataType);
    } ;
    
    overLoadConstructor(size=MAX_BUFFER_SIZE, data="",dataType="utf8") {
        this.maxSize = size ;
        this.dataType = dataType ;
        this.buffer = Buffer.alloc(this.maxSize,data, this.dataType);
    }

    toString() {
        return this.buffer.toString() ;
    } ;
    
    toInt() {
        return this.buffer.toInt() ;
    };
    
    toFloat() {
        return this.buffer.toFloat() ;
    } ;
} ;

exports.Fisl = Fisl ;