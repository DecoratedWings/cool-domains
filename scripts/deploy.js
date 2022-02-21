const main = async () => {

    //Deploy Domain Contract 
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy("lit");
    await domainContract.deployed();

    //Deploy Launch Domain Contract
    const launchDomainContractFactory = await hre.ethers.getContractFactory('LaunchDomains');
    const launchDomainContract = await launchDomainContractFactory.deploy("lit");
    await launchDomainContract.deployed();

    console.log("Contract deployed to:", domainContract.address);

    let txn = await domainContract.register("fireDomain", { value: hre.ethers.utils.parseEther('0.1') });
    await txn.wait();
    console.log("Minted domain fireDomain.lit");

    txn = await domainContract.setRecord("fireDomain", "Domain of Fire is Burning");
    await txn.wait();
    console.log("Set record for fireDomain.lit");

    const address = await domainContract.getAddress("fireDomain");
    console.log("Owner of domain fireDomain:", address);

    const balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));


    console.log("------------------------")

    let txn2 = await launchDomainContract.registerLaunchDomain("fireNFT", 2, { value: hre.ethers.utils.parseEther('0.1') });
    await txn2.wait();
    console.log("Minted lauch domain fireNFT.lit");

    let txn2_2 = await launchDomainContract.registerLaunchDomain("fireNFTMint", 3, { value: hre.ethers.utils.parseEther('0.1') });
    await txn2_2.wait();
    console.log("Minted lauch domain fireNFTMint.lit");

    console.log('Launch domain status before delete:');
    const txn3 = await launchDomainContract.checkLaunchDomainActive();

    const txn4 = await launchDomainContract.removeInactiveLaunchDomains("fireDomain", true);
    console.log('Launch domain status after delete:');
    const txn5 = await launchDomainContract.checkLaunchDomainActive();

    console.log("------------------------")


}

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();