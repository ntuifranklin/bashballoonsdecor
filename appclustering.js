
const app = require("./server.js");
//clustering
const cluster = require("cluster");
const totalCPUs = require("os").availableParallelism();

// for server ip :
const ip = require("ip");

const {isTestEnvUpgraded} = require('./utilities/functions.js');

if (cluster.isMaster) {
    
    console.log(`Number of CPUs is ${totalCPUs}`);
    console.log(`Master ${process.pid} is running`);
   
    // Fork workers.
    for (let i = 0; i < totalCPUs; i++) {
      cluster.fork();
    }
   
    cluster.on("exit", (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      console.log("Let's fork another worker!");
      cluster.fork();
    });
} else {     
        
    
    const SERVER_IP =  ip.address() ;
    var isTestingEnv = isTestEnvUpgraded(current_dir=new String(__dirname));
        
    const TEST_PORT = process.env.TEST_SITE_PORT_UPGRADE;
    const PROD_PORT = process.env.PRODUCTION_SITE_PORT_UPGRADE;
    var PORT = TEST_PORT ;
    if ( !isTestingEnv) {
        PORT = PROD_PORT;
        console.log(`Production port loaded: ${PORT}`);
    } else if (isTestingEnv) {
        PORT = TEST_PORT;
        console.log(`Testing port loaded: ${PORT}`);
    } else {
        throw Error("We could neither detect testing or production environment");
    }
    //exporting app for testing
    app.listen(PORT, () => {
        console.log(`Express server listening on : ${SERVER_IP}:${PORT} `);     
    });
  
} ;