
const HostelComplaints = artifacts.require("HostelComplaintSystem");

module.exports = function(deployer) {
    deployer.deploy(HostelComplaints);
};
