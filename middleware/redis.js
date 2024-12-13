const { createClient } = require("redis");
const hash = require("object-hash");

const {
   CATEGORIES_TABLE
} = require('../utilities/web_page_variables');
const {getCategories} = require('../database/controllers/database');
let redisClient = undefined;


/*
const REDIS_CACHING_OPTIONS = 
{
    EX, // the specified expire time in seconds
    PX, // the specified expire time in milliseconds
    EXAT, // the specified Unix time at which the key will expire, in seconds
    PXAT, // the specified Unix time at which the key will expire, in milliseconds
    NX, // write the data only if the key does not already exist
    XX, // write the data only if the key already exists
    KEEPTTL, // retain the TTL associated with the key
    GET, // return the old string stored at key, or "undefined" if key did not exist
}
*/

const REDIS_DEFAULT_CACHING_OPTIONS = 
{
    
    EX: 3600, // 3600 is 1h , while 43200 is 12h
    NX: false, // write the data even if the key already exists
} ;

exports.REDIS_DEFAULT_CACHING_OPTIONS = REDIS_DEFAULT_CACHING_OPTIONS;

async function initializeRedisClient() {
    // read the Redis connection URL from the envs
    let redisURL = process.env.REDIS_URI
    if (redisURL) {
      // create the Redis client object
      redisClient = createClient({ url: redisURL }).on("error", (e) => {
        console.error(`Failed to create the Redis client with error:`);
        console.error(e);
      });
  
      try {
        // connect to the Redis server
        await redisClient.connect();
        console.log(`Connected to Redis successfully!`);
      } catch (e) {
        console.error(`Connection to Redis failed with error:`);
        console.error(e);
      }
    }
}
exports.redisClient = redisClient ;
exports.initializeRedisClient = initializeRedisClient ;

async function clearRedisClientDB(){
    if (isRedisWorking()){
                
        // Clear the current database
        redisClient.flushdb((err, succeeded) => {
            if (err) {
            console.error('Error clearing Redis cache:', err);
            } else {
            console.log('Redis cache cleared successfully:', succeeded);
            }
        });
        
        // Clear all databases
        redisClient.flushall((err, succeeded) => {
            if (err) {
            console.error('Error clearing all Redis databases:', err);
            } else {
            console.log('All Redis databases cleared successfully:', succeeded);
            }
        });
    }
}
exports.clearRedisClientDB = clearRedisClientDB ;

function requestToKey(request) {
// build a custom object to use as part of the Redis key
const reqDataToHash = {
    query: request.query,
    body: request.body,
};

// `${req.path}@...` to make it easier to find
// keys on a Redis client
return `${request.path}@${hash.sha1(reqDataToHash)}`;
} ;

exports.requestToKey = requestToKey ;

function isRedisWorking() {
// verify wheter there is an active connection
// to a Redis server or not
return !!redisClient?.isOpen;
}

exports.isRedisWorking = isRedisWorking ;

async function writeDataToRedisCache(key, data, options=REDIS_DEFAULT_CACHING_OPTIONS) {
if (isRedisWorking()) {
    try {
    // write data to the Redis cache
    //var d = JSON.stringify(data);
    await redisClient.set(key, data, options);
    //console.log(`Logging [${__filename}] : on Writing data : ${data} to Redis`);
    } catch (e) {
        console.error(`Failed to cache data for key=${key}`, e);
    }
}
}  ;

exports.writeDataToRedisCache = writeDataToRedisCache ;

async function readDataFromRedisCache(key) {
let cachedValue = undefined;

if (isRedisWorking()) {
    // try to get the cached response from redis
    //console.log(`Redis attempting to read key : ${key}`);
    cachedValue = await redisClient.get(key);
    if (cachedValue) {
        //console.log(`Redis returning value for key : `);
        //console.log(JSON.stringify(cachedValue, null, 2));
        return cachedValue;
    }
    return null ;
}
}

exports.readDataFromRedisCache = readDataFromRedisCache;

async function deleteDataFromRedisCache(key) {
   
    
    if (isRedisWorking()) {
        // try to get the cached response from redis
        redisClient.del(key, function (err, reply) {
            if (!err)
                console.log(`Redis Deletion of key: ${key} successful with reply: ${reply}`);
            
        });
       
    }
}
    
exports.deleteDataFromRedisCache = deleteDataFromRedisCache;


function redisCacheMiddleware( options = REDIS_DEFAULT_CACHING_OPTIONS) {
return async (request, response, next) => {
    if (isRedisWorking()) {
        const key = requestToKey(request);
        // if there is some cached data, retrieve it and return it
        const cachedValue = await readDataFromRedisCache(key);
        if (cachedValue) {
            try {
            // if it is JSON data, then return it
            return response.json(JSON.parse(cachedValue));
            } catch {
            // if it is not JSON data, then return it
            return response.send(cachedValue);
            }
        } else {
            // override how res.send behaves
            // to introduce the caching logic
            const oldSend = response.send;
            response.send = function (data) {
            // set the function back to avoid the 'double-send' effect
            response.send = oldSend;

            // cache the response only if it is successful
            if (response.statusCode.toString().startsWith("2")) {
                writeDataToRedisCache(key, data, options).then();
            }

            return response.send(data);
            };

            // continue to the controller function
            next();
        }
    } else {
    // proceed with no caching
        next();
    }
};
} ;

exports.redisCacheMiddleware = redisCacheMiddleware ;


async function setRedisUserCartCacheMiddleware (request, response, next) {
        if (isRedisWorking()) {

            // the variable name used to store the user's cart information
            const key = request.locals.USER_CART_NAME;
            // if there is some cached data, retrieve it and return it
            var cachedValue = await readDataFromRedisCache(key);
            if (cachedValue) {
                cachedValue = await JSON.parse(cachedValue);
                //request.locals.USER_CART = cachedValue ;
            } else {
                
                const USER_CART_REDIS_CACHING_OPTIONS = 
                {
                    
                    EX: process.env.ADMIN_USER_EXPIRE_TIME, // 15 minutes. User has to log in every 15 minutes
                    NX: true, // write the data even if the key already exists
                } ;
                cachedValue = JSON.stringify({});
                await writeDataToRedisCache(key, cachedValue, USER_CART_REDIS_CACHING_OPTIONS);
                
            } ;
            request.locals.USER_CART = cachedValue ;
           
        } 
        // proceed with no caching
        next();
        
};

exports.setRedisUserCartCacheMiddleware = setRedisUserCartCacheMiddleware ;


async function setRedisLoggedInUserCacheMiddleware (request, response, next) {
    if (isRedisWorking()) {

        // the variable name used to store the user's cart information
        const key = request.locals.LOGGEDIN_USER_VARIABLE_NAME;
        // if there is some cached data, retrieve it and return it
        var cachedValue = await readDataFromRedisCache(key);
        if (cachedValue) {
            
            //console.log(`Redis returning value for user key : `);
            //console.log(JSON.stringify(cachedValue, null, 2));
            cachedValue = await JSON.parse(cachedValue);
            //request.locals.USER = cachedValue ;
        } else {
            
            const USER_REDIS_CACHING_OPTIONS = 
            {
                
                EX: process.env.ADMIN_USER_EXPIRE_TIME, // 15 minutes. User has to log in every 15 minutes
                NX: true, // write the data even if the key already exists
            } ;
            cachedValue = JSON.stringify({});
            await writeDataToRedisCache(key, cachedValue, USER_REDIS_CACHING_OPTIONS);
            //request.locals.USER = cachedValue ;
        } ;
        request.locals.USER = cachedValue ;
        
    } 
    // proceed with no caching
    next();
    
};

exports.setRedisLoggedInUserCacheMiddleware = setRedisLoggedInUserCacheMiddleware ;
