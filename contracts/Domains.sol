// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "hardhat/console.sol";
import { StringUtils } from "./libraries/StringUtils.sol";

//TODO: separate launch domains from regular domains
contract Domains {

    //Top Level Domain (what the record ends with)
    string public tld;
    string public tldLaunch;


  mapping(string => address) public domains;

  // Checkout our new mapping! This will store values
  mapping(string => string) public records;

  struct LaunchDomain{
      string name;
      uint deadline; 
      uint initiatedTime;
      bool active;
  }
   // Custom launch domain for NFT launch campaigns
    // will have a time limit and expire thereafter
    // (ideal for use cases like mint lists, limited time domains, etc)
  mapping(string => address) public launchDomainNames;
  mapping(address => LaunchDomain) public launchDomainStatus;

  LaunchDomain[] public launchDomains;

   // We make the contract "payable" by adding this to the constructor
  constructor(string memory _tld, string memory _tldLaunch) payable {
    tld = _tld;
    tldLaunch = _tldLaunch;
    console.log("%s name service deployed", _tld);
    console.log("%s name service deployed", _tldLaunch);
  }
		
  // This function will give us the price of a domain based on length
  //Shorter domains are more expensive!
  function price(string calldata name) public pure returns(uint) {
    uint len = StringUtils.strlen(name);
    require(len > 0);
    if (len == 3) {
      return 5 * 10**17; // 5 MATIC = 5 000 000 000 000 000 000 (18 decimals). We're going with 0.5 Matic cause the faucets don't give a lot
    } else if (len == 4) {
      return 3 * 10**17; // To charge smaller amounts, reduce the decimals. This is 0.3
    } else {
      return 1 * 10**17;
    }
  }

  function register(string calldata name) public payable{
      // Check that the name is unregistered
      require(domains[name] == address(0));
      uint _price = price(name);

    // Check if enough Matic was paid in the transaction
      require(msg.value >= _price, "Not enough Matic paid");
      domains[name] = msg.sender;
      console.log("%s has registered a domain!", msg.sender);
  }

    //register for launchDomains
  function registerLaunchDomain(string calldata name, uint numberOfDays) public payable{ 
      require(launchDomainNames[name] == address(0) || launchDomainStatus[msg.sender].active == false);
      uint _price = price(name);

    // Check if enough Matic was paid in the transaction
      require(msg.value >= _price, "Not enough Matic paid");

      launchDomainNames[name] = msg.sender;
      launchDomainStatus[msg.sender].active = true;
      
      LaunchDomain memory domain;
      domain.name = name;
      domain.deadline = block.timestamp + (numberOfDays * 1 days);
      domain.initiatedTime = block.timestamp;
      domain.active = true;

      launchDomains.push(domain);
      console.log("%s has temporarily created a launch domain!", msg.sender);
  }

  function getAddress(string calldata name) public view returns (address) {
      // Check that the owner is the transaction sender
      return domains[name];
  }

  function setRecord(string calldata name, string calldata record) public {
      // Check that the owner is the transaction sender
      require(domains[name] == msg.sender);
      records[name] = record;
  }

  function getRecord(string calldata name) public view returns(string memory) {
      return records[name];
  }

  function checkLaunchDomainActive() public view returns (bool){
      LaunchDomain memory domain = launchDomainStatus[msg.sender];
      console.log("%s has domain %s with status: ", msg.sender, domain.name, domain.active);
      return domain.active;
  }

  function removeInactiveLaunchDomains(string calldata name, bool userForceDelete) external {

    LaunchDomain memory domain = launchDomainStatus[msg.sender];

    if(userForceDelete || domain.deadline > block.timestamp){
         domain.active = false;
         domain.initiatedTime = 0;
         domain.deadline= 0;

         delete launchDomainStatus[msg.sender];
         launchDomainNames[name] = address(0);

         for(uint i =0; i < launchDomains.length; i++){
             if(keccak256(abi.encodePacked(launchDomains[i].name)) == keccak256(abi.encodePacked(domain.name))){
                 delete launchDomains[i];
             }
         }
     }
  }
  
}