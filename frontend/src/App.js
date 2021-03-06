import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';
import domainsABI from './utils/Domains.json';
import launchDomainsABI from './utils/LaunchDomains.json';
import domainBaseABI from './utils/DomainBase.json';
import InfoModal from './InfoModal.js';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const BUILDSPACE_TWITTER = `https://twitter.com/_buildspace`;

// Add the domain you will be minting
const tld = '.lit';
//V1
// const CONTRACT_ADDRESS = '0xCfe936278B54AfE3716f796D52f9D589b95d31F8';
// const LAUNCH_CONTRACT_ADDRESS = '0x5Dc472F15f84852dEd0DD6c0556AbC874ed2DBf7';

//V2
const CONTRACT_ADDRESS = '0x55cd759a942A862d7b601D914eCcC4cF33C23Ff5';
const LAUNCH_CONTRACT_ADDRESS = '0x35c3ff4617422925FE53185C4Ec399E818C572D9';

const App = () => {

  //Just a state variable we use to store our user's public wallet. Don't forget to import useState at the top.
  const [currentAccount, setCurrentAccount] = useState('');
  // Add some state data properties
  const [domain, setDomain] = useState('');
  const [record, setRecord] = useState('');
  const [network, setNetwork] = useState('');
  const [modalShow, setModalShow] = React.useState(false);


  // Implement your connectWallet method here
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      // Fancy method to request access to account.
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      // Boom! This should print out public address once we authorize Metamask.
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }


  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have metamask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);
    } else {
      console.log('No authorized account found');
    }

    // This is the new part, we check the user's network chain ID
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    setNetwork(networks[chainId]);

    ethereum.on('chainChanged', handleChainChanged);

    // Reload the page when they change networks
    function handleChainChanged(_chainId) {
      window.location.reload();
    }
  };

  const mintDomain = async () => {
    // Don't run if the domain is empty
    if (!domain) { return }
    // Alert the user if the domain is too short
    if (domain.length < 3) {
      alert('Domain must be at least 3 characters long');
      return;
    }
    // Calculate price based on length of domain (change this to match your contract)	
    // 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
    const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
    console.log("Minting domain", domain, "with price", price);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, domainsABI.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let tx = await contract.register(domain, { value: ethers.utils.parseEther(price) });
        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Check if the transaction was successfully completed
        if (receipt.status === 1) {

          console.log("Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash);

          // Set the record for the domain
          tx = contract.setRecord(domain, record);
          await tx.wait();

          console.log("Record set! https://mumbai.polygonscan.com/tx/" + tx.hash);

          setRecord('');
          setDomain('');
        }
        else {
          alert("Transaction failed! Please try again");
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  // Create a function to render if wallet is not connected yet
  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      <img src="https://media.giphy.com/media/l0HlTy9x8FZo0XO1i/giphy.gif" alt="Fire gif" />
      {/* Call the connectWallet function we just wrote when the button is clicked */}
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect Wallet
      </button>
    </div>
  );

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        // Try to switch to the Mumbai testnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
        });
      } catch (error) {
        // This error code means that the chain we want has not been added to MetaMask
        // In this case we ask the user to add it to their MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13881',
                  chainName: 'Polygon Mumbai Testnet',
                  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                  nativeCurrency: {
                    name: "Mumbai Matic",
                    symbol: "MATIC",
                    decimals: 18
                  },
                  blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        }
        console.log(error);
      }
    } else {
      // If window.ethereum is not found then MetaMask is not installed
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  }

  // Form to enter domain name and data
  const renderInputForm = () => {
    // If not on Polygon Mumbai Testnet, render "Please connect to Polygon Mumbai Testnet"
    if (network !== 'Polygon Mumbai Testnet') {
      return (
        <div className="connect-wallet-container">
          <p>Please connect to the Polygon Mumbai Testnet</p>
        </div>
      );
    }
    return (
      <div className="form-container">
        <div className="first-row">
          <input
            type="text"
            value={domain}
            placeholder='domain'
            onChange={e => setDomain(e.target.value)}
          />
          <p className='tld'> {tld} </p>
        </div>

        <input
          type="text"
          value={record}
          placeholder='why is your domain hella rad?'
          onChange={e => setRecord(e.target.value)}
        />

        <div className="button-container">
          <button className='cta-button mint-button' disabled={null} onClick={mintDomain}>
            Mint
          </button>
          {/*TODO: ADD MINT LAUNCH DOMAIN METHOD*/}
          <button className='cta-button mint-launch-button' disabled={null} onClick={null}>
            Mint Launch Domain
          </button>
        </div>

        <div className="button-container">
          <button className='cta-button set-data-button' disabled={null} onClick={null}>
            Set data
          </button>
        </div>

      </div>
    );
  }

  // This runs our function when the page loads.
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <header>
            <div className="left">
              <p className="title">???? Lit Name Service ????</p>
              <p className="subtitle">~ Mint a Fire Domain on Polygon ~</p>
            </div>
            {/* Display a logo and wallet connection status*/}
            <div className="right">
              <img alt="Network logo" className="logo" src={network.includes("Polygon") ? polygonLogo : ethLogo} />
              {currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p>}
            </div>
          </header>
        </div>

        {/* Hide the connect button if currentAccount isn't empty*/}
        {!currentAccount && renderNotConnectedContainer()}
        {/* Render the input form if an account is connected */}
        {currentAccount && renderInputForm()}


        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={BUILDSPACE_TWITTER}
            target="_blank"
            rel="noreferrer"
          >BuildSpace</a>
          <InfoModal show={modalShow} onHide={() => setModalShow(false)} />

       
          </div>
      </div>
    </div>
  );
}

export default App;
