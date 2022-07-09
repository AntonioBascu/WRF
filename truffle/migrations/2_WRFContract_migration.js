const temperaturas = artifacts.require("WRFContract");

module.exports = function (deployer) {
  deployer.deploy(temperaturas);
};
 