const main = async () => {
    //compile our contract and generate necessary artifacts: 
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');

    //hardhat creates local ethereum blockchain:
    const domainContract = await domainContractFactory.deploy();
    //deploy our contract on that local chain:
    await domainContract.deployed();

    console.log("Contract deployed to:", domainContract.address);
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