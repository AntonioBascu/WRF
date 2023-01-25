const wrfContract = artifacts.require("WRFContract");

module.exports = function (deployer) {
  deployer.deploy(wrfContract);
};
 