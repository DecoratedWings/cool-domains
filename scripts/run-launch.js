const main = async () => {

    const [owner] = await hre.ethers.getSigners();

    const domainContractFactory = await hre.ethers.getContractFactory('LaunchDomains');

    const domainContract = await domainContractFactory.deploy('lit');
    await domainContract.deployed();

    console.log("Contract deployed to:", domainContract.address);
    console.log("Contract deployed by:", owner.address);

    // We're passing in a second variable - value. This is the moneyyyyyyyyyy
    let txn = await domainContract.registerLaunchDomain("fireDomain", 2, { value: hre.ethers.utils.parseEther('0.3') });
    await txn.wait();

    const address = await domainContract.getAddress("fireDomain");
    console.log("Owner of domain fire:", address);

    const balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));

    console.log("------------------------")

    console.log('Launch domain status before delete:');
    const txn3 = await domainContract.checkLaunchDomainActive();

    const txn4 = await domainContract.removeInactiveLaunchDomains("fireDomain", true);
    console.log('Launch domain status after delete:');
    const txn5 = await domainContract.checkLaunchDomainActive();

    console.log("------------------------")
};

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