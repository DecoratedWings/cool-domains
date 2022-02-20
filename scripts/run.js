const main = async () => {

    const [owner, randomPerson] = await hre.ethers.getSigners();

    //compile our contract and generate necessary artifacts: 
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');

    //hardhat creates local ethereum blockchain:
    const domainContract = await domainContractFactory.deploy();
    //deploy our contract on that local chain:
    await domainContract.deployed();

    console.log("Contract deployed to:", domainContract.address);
    console.log("Contract deployed by:", owner.address);
    
    const txn = await domainContract.register("doom");
    await txn.wait();
  
    const domainOwner = await domainContract.getAddress("doom");
    console.log("Owner of domain:", domainOwner);
    console.log("------------------------")  

     // Trying to set a record that doesn't belong to me!
    // txn = await domainContract.connect(randomPerson).setRecord("doom", "Haha my domain now!");
    // await txn.wait();

    const txn2 = await domainContract.registerLaunchDomain("eth", 2);
    await txn2.wait();
    
    const txn3 = await domainContract.checkLaunchDomainActive();

    const txn4 = await domainContract.removeInactiveLaunchDomains("eth", true);
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