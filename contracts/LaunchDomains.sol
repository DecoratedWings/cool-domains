// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

// We first import some OpenZeppelin Contracts.
import './DomainBase.sol';

contract LaunchDomains is DomainBase {

	// Magic given to us by OpenZeppelin to help us keep track of tokenIds.
	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;

	string svgPartOne =
		'<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270" fill="none"><path fill="url(#a)" d="M0 0h270v270H0z"/><defs><filter id="b" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="270" width="270"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity=".225" width="200%" height="200%"/></filter></defs><path d="M72.863 42.949a4.382 4.382 0 0 0-4.394 0l-10.081 6.032-6.85 3.934-10.081 6.032a4.382 4.382 0 0 1-4.394 0l-8.013-4.721a4.52 4.52 0 0 1-1.589-1.616 4.54 4.54 0 0 1-.608-2.187v-9.31a4.27 4.27 0 0 1 .572-2.208 4.25 4.25 0 0 1 1.625-1.595l7.884-4.59a4.382 4.382 0 0 1 4.394 0l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616 4.54 4.54 0 0 1 .608 2.187v6.032l6.85-4.065v-6.032a4.27 4.27 0 0 0-.572-2.208 4.25 4.25 0 0 0-1.625-1.595L41.456 24.59a4.382 4.382 0 0 0-4.394 0l-14.864 8.655a4.25 4.25 0 0 0-1.625 1.595 4.273 4.273 0 0 0-.572 2.208v17.441a4.27 4.27 0 0 0 .572 2.208 4.25 4.25 0 0 0 1.625 1.595l14.864 8.655a4.382 4.382 0 0 0 4.394 0l10.081-5.901 6.85-4.065 10.081-5.901a4.382 4.382 0 0 1 4.394 0l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616 4.54 4.54 0 0 1 .608 2.187v9.311a4.27 4.27 0 0 1-.572 2.208 4.25 4.25 0 0 1-1.625 1.595l-7.884 4.721a4.382 4.382 0 0 1-4.394 0l-7.884-4.59a4.52 4.52 0 0 1-1.589-1.616 4.53 4.53 0 0 1-.608-2.187v-6.032l-6.85 4.065v6.032a4.27 4.27 0 0 0 .572 2.208 4.25 4.25 0 0 0 1.625 1.595l14.864 8.655a4.382 4.382 0 0 0 4.394 0l14.864-8.655a4.545 4.545 0 0 0 2.198-3.803V55.538a4.27 4.27 0 0 0-.572-2.208 4.25 4.25 0 0 0-1.625-1.595l-14.993-8.786z" fill="silver"/><defs><linearGradient id="a" x1="0" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop stop-color="#ffff"/><stop offset="1" stop-color="gray" stop-opacity=".99"/></linearGradient></defs><text x="32.5" y="231" font-size="27" fill="#000" filter="url(#b)" font-family="Plus Jakarta Sans,DejaVu Sans,Noto Color Emoji,Apple Color Emoji,sans-serif" font-weight="bold">';
	string svgPartTwo = '</text></svg>';

	struct LaunchDomain {
		string name;
		uint256 deadline;
		uint256 initiatedTime;
		bool active;
	}
	// Custom launch domain for NFT launch campaigns
	// will have a time limit and expire thereafter
	// (ideal for use cases like mint lists, limited time domains, etc)
	mapping(string => address) public launchDomainNames;
	mapping(address => LaunchDomain) public launchDomainStatus;

	LaunchDomain[] public launchDomains;

	constructor(string memory _tld) payable ERC721('Lit Name Service', 'LNS') {
		tld = _tld;
		console.log('%s name service deployed', _tld);
	}

	//register for launchDomains
	function registerLaunchDomain(string calldata name, uint256 numberOfDays) public payable override {
		require(launchDomainNames[name] == address(0) || launchDomainStatus[msg.sender].active == false);
		uint256 _price = price(name);

		// Check if enough Matic was paid in the transaction
		require(msg.value >= _price, 'Not enough Matic paid');

		launchDomainNames[name] = msg.sender;
		launchDomainStatus[msg.sender].active = true;

		LaunchDomain memory domain;
		domain.name = name;
		domain.deadline = block.timestamp + (numberOfDays * 1 days);
		domain.initiatedTime = block.timestamp;
		domain.active = true;

		launchDomains.push(domain);
		console.log('%s has temporarily created a launch domain!', msg.sender);

		// Combine the name passed into the function  with the TLD
		string memory _name = string(abi.encodePacked(name, '.', tld));
		// Create the SVG (image) for the NFT with the name
		string memory finalSvg = string(abi.encodePacked(svgPartOne, _name, unicode'🔥', svgPartTwo));
		uint256 newRecordId = _tokenIds.current();
		uint256 length = StringUtils.strlen(name);
		string memory strLen = Strings.toString(length);

		console.log('Registering %s.%s on the contract with tokenID %d', name, tld, newRecordId);

		// Create the JSON metadata of our NFT. We do this by combining strings and encoding as base64
		string memory json = Base64.encode(
			bytes(
				string(
					abi.encodePacked(
						'{"name": "',
						_name,
						'", "description": "A domain on the Lit name service", "image": "data:image/svg+xml;base64,',
						Base64.encode(bytes(finalSvg)),
						'","length":"',
						strLen,
						'"}'
					)
				)
			)
		);

		string memory finalTokenUri = string(abi.encodePacked('data:application/json;base64,', json));

		console.log('\n--------------------------------------------------------');
		console.log('Final tokenURI', finalTokenUri);
		console.log('--------------------------------------------------------\n');

		_safeMint(msg.sender, newRecordId);
		_setTokenURI(newRecordId, finalTokenUri);

		_tokenIds.increment();
	}

	function checkLaunchDomainActive() public view returns (bool) {
		LaunchDomain memory domain = launchDomainStatus[msg.sender];
		console.log('%s has domain %s with status: ', msg.sender, domain.name, domain.active);
		return domain.active;
	}

	function removeInactiveLaunchDomains(string calldata name, bool userForceDelete) external {
		LaunchDomain memory domain = launchDomainStatus[msg.sender];

		if (userForceDelete || domain.deadline > block.timestamp) {
			domain.active = false;
			domain.initiatedTime = 0;
			domain.deadline = 0;

			delete launchDomainStatus[msg.sender];
			launchDomainNames[name] = address(0);

			for (uint256 i = 0; i < launchDomains.length; i++) {
				if (keccak256(abi.encodePacked(launchDomains[i].name)) == keccak256(abi.encodePacked(domain.name))) {
					delete launchDomains[i];
				}
			}
		}
	}
}
