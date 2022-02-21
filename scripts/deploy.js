const main = async () => {

    //Deploy Domain Contract 
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy("lit");
    await domainContract.deployed();

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