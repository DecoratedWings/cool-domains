// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

// We first import some OpenZeppelin Contracts.
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

import 'hardhat/console.sol';
import { StringUtils } from './libraries/StringUtils.sol';
import { Base64 } from './libraries/Base64.sol';

abstract contract DomainBase is ERC721URIStorage {
	// Magic given to us by OpenZeppelin to help us keep track of tokenIds.
	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;
	//Top Level Domain (what the record ends with)
	string public tld;
	address payable public owner;

	mapping(string => address) public domains;
	mapping(string => string) public records;
	mapping(uint256 => string) public names;

	error Unauthorized();
	error AlreadyRegistered();
	error InvalidName(string name);

	// This function will give us the price of a domain based on length
	//Shorter domains are more expensive!
	function price(string calldata name) public pure returns (uint256) {
		uint256 len = StringUtils.strlen(name);
		require(len > 0);
		if (len == 3) {
			return 5 * 10**17; // 5 MATIC = 5 000 000 000 000 000 000 (18 decimals). We're going with 0.5 Matic cause the faucets don't give a lot
		} else if (len == 4) {
			return 3 * 10**17; // To charge smaller amounts, reduce the decimals. This is 0.3
		} else {
			return 1 * 10**17;
		}
	}

	function register(string calldata name) public payable virtual {}

	function registerLaunchDomain(string calldata name, uint256 numberOfDays) public payable virtual {}

	modifier onlyOwner() {
		require(isOwner());
		_;
	}

	function isOwner() public view returns (bool) {
		return msg.sender == owner;
	}

	function withdraw() public onlyOwner {
		uint256 amount = address(this).balance;

		(bool success, ) = msg.sender.call{ value: amount }('');
		require(success, 'Failed to withdraw Matic');
	}

	function getAddress(string calldata name) public view returns (address) {
		// Check that the owner is the transaction sender
		return domains[name];
	}

	function setRecord(string calldata name, string calldata record) public {
		if (msg.sender != domains[name]) revert Unauthorized();
		records[name] = record;
	}

	function getRecord(string calldata name) public view returns (string memory) {
		return records[name];
	}

	// Add this anywhere in your contract body
	function getAllNames() public view returns (string[] memory) {
		console.log('Getting all names from contract');
		string[] memory allNames = new string[](_tokenIds.current());
		for (uint256 i = 0; i < _tokenIds.current(); i++) {
			allNames[i] = names[i];
			console.log('Name for token %d is %s', i, allNames[i]);
		}

		return allNames;
	}

	function valid(string calldata name) public pure returns (bool) {
		return StringUtils.strlen(name) >= 3 && StringUtils.strlen(name) <= 10;
	}
}
