const rejected_domains = ["mmahan.io", "eignh.com"];
require('dotenv').config();
const accepted_domains = [new String(process.env.SEO_SITE_LINK)];

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
    };
    for (let k=0; k < accepted_domains.length; k++) {
      if (!domain.includes(accepted_domains[k])){
          //console.log(`firewall, d: ${domain},r: ${accepted_domains[k]}`);
          return false ;
      }      
    }
  return true ;
} ;

module.exports = firewall;