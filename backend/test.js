const dns = require("dns");

console.log("Before:", dns.getServers());

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("After:", dns.getServers());

dns.resolveSrv(
  "_mongodb._tcp.cluster19.4pdbcyd.mongodb.net",
  (err, addresses) => {
    console.log(err);
    console.log(addresses);
  }
);