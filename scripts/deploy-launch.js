const main = async () => {

    //Deploy Launch Domain Contract
    const launchDomainContractFactory = await hre.ethers.getContractFactory('LaunchDomains');
    const launchDomainContract = await launchDomainContractFactory.deploy("lit");
    await launchDomainContract.deployed();

    console.log("Contract deployed to:", launchDomainContract.address);

    console.log("------------------------")

    let txn2 = await launchDomainContract.registerLaunchDomain("fireNFT", 2, { value: hre.ethers.utils.parseEther('0.1') });
    await txn2.wait();
    console.log("Minted lauch domain fireNFT.lit");

    const address = await launchDomainContract.getAddress("fireNFT");
    console.log("Owner of domain fireDomain:", address);

    let txn2_2 = await launchDomainContract.registerLaunchDomain("fireNFTMint", 3, { value: hre.ethers.utils.parseEther('0.1') });
    await txn2_2.wait();
    console.log("Minted lauch domain fireNFTMint.lit");

    const address2 = await launchDomainContract.getAddress("fireNFTMint");
    console.log("Owner of domain fireNFTMint:", address2);

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