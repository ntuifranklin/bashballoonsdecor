const rejected_domains = ["mmahan.io", "eignh.com"];

function firewall(req, res, next) {
  const domain = (new String(req.headers.host)).toLocaleLowerCase(); 

  if (!isAllowedDomain(domain)) {
    return res.status(400).send(`The website ${domain} belongs to a scammer. Please report this website`);
  }

  next();
}

function isAllowedDomain(domain) {
    for (let k=0; k < rejected_domains.length; k++) {
        if (domain.includes(rejected_domains[k])){
            //console.log(`firewall, d: ${domain},r: ${rejected_domains[k]}`);
            return false ;
        }
            
    }
  return true ;
} ;

module.exports = firewall;