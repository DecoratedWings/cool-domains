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
  let txn = await domainContract.register("fireDomain",  {value: hre.ethers.utils.parseEther('0.3')});
  await txn.wait();

  const address = await domainContract.getAddress("fireDomain");
  console.log("Owner of domain fire:", address);

  const balance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
    
    // const txn = await domainContract.register("doom");
    // await txn.wait();
  
    // const domainOwner = await domainContract.getAddress("doom");
    // console.log("Owner of domain:", domainOwner);
    console.log("------------------------")  

     // Trying to set a record that doesn't belong to me!
    // txn = await domainContract.connect(randomPerson).setRecord("doom", "Haha my domain now!");
    // await txn.wait();

    //ToDo Uncomment:
    // const txn2 = await domainContract.registerLaunchDomain("eth", 2,  {value: hre.ethers.utils.parseEther('100')});
    // await txn2.wait();
    
    // const txn3 = await domainContract.checkLaunchDomainActive();

    // const txn4 = await domainContract.removeInactiveLaunchDomains("eth", true);
    // const txn5 = await domainContract.checkLaunchDomainActive();

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