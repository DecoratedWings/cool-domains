const main = async () => {

    const [owner, randomPerson] = await hre.ethers.getSigners();

    //compile our contract and generate necessary artifacts: 
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');

    //hardhat creates local ethereum blockchain:
    const domainContract = await domainContractFactory.deploy('lit');
    //deploy our contract on that local chain:
    await domainContract.deployed();

    console.log("Contract deployed to:", domainContract.address);
    console.log("Contract deployed by:", owner.address);

    // We're passing in a second variable - value. This is the moneyyyyyyyyyy
    let txn = await domainContract.register("fireDomain", { value: hre.ethers.utils.parseEther('0.3') });
    await txn.wait();

    const address = await domainContract.getAddress("fireDomain");
    console.log("Owner of domain fire:", address);

    const balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));

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