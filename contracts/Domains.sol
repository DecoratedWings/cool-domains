// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "hardhat/console.sol";

contract Domains {
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

  constructor() {
      console.log("For the record, this contract is hella rad~");
  }

  function register(string calldata name) public {
      // Check that the name is unregistered
      require(domains[name] == address(0));
      domains[name] = msg.sender;
      console.log("%s has registered a domain!", msg.sender);
  }

    //register for launchDomains
  function registerLaunchDomain(string calldata name, uint numberOfDays) public { 
      require(launchDomainNames[name] == address(0) || launchDomainStatus[msg.sender].active == false);

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