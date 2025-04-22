import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { TokenABI } from '../contracts/TokenABI';

interface Web3ContextType {
  isConnected: boolean;
  walletAddress: string | null;
  balance: string;
  chainId: number | null;
  provider: any;
  signer: any;
  tokenContract: any;
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => void;
  stakeTokens: (amount: string) => Promise<boolean>;
  unstakeTokens: (amount: string) => Promise<boolean>;
  getTokenBalance: () => Promise<string>;
}

const TOKEN_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual contract address
const POLYGON_CHAIN_ID = 137; // Mainnet
// const POLYGON_CHAIN_ID = 80001; // Mumbai Testnet

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [tokenContract, setTokenContract] = useState<any>(null);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            
            setProvider(provider);
            setWalletAddress(accounts[0]);
            setChainId(network.chainId);
            setIsConnected(true);
            
            // Set signer and contracts
            const signer = provider.getSigner();
            setSigner(signer);
            const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TokenABI, signer);
            setTokenContract(tokenContract);
            
            // Get ETH balance
            const balance = await provider.getBalance(accounts[0]);
            setBalance(ethers.utils.formatEther(balance));
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          // Update signer and contracts with new account
          if (provider) {
            const signer = provider.getSigner();
            setSigner(signer);
            const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TokenABI, signer);
            setTokenContract(tokenContract);
          }
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [provider]);

  const connectWallet = async (): Promise<string | null> => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask to connect.');
      return null;
    }

    try {
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Set up provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      
      // Get network info
      const network = await provider.getNetwork();
      setChainId(network.chainId);
      
      // Check if on Polygon
      if (network.chainId !== POLYGON_CHAIN_ID) {
        try {
          // Try to switch to Polygon
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${POLYGON_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          // If Polygon is not added to MetaMask, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${POLYGON_CHAIN_ID.toString(16)}`,
                    chainName: 'Polygon Mainnet',
                    nativeCurrency: {
                      name: 'MATIC',
                      symbol: 'MATIC',
                      decimals: 18,
                    },
                    rpcUrls: ['https://polygon-rpc.com/'],
                    blockExplorerUrls: ['https://polygonscan.com/'],
                  },
                ],
              });
            } catch (addError) {
              toast.error('Failed to add Polygon network to MetaMask');
              return null;
            }
          } else {
            toast.error('Failed to switch to Polygon network');
            return null;
          }
        }
      }
      
      // Set wallet info
      setWalletAddress(accounts[0]);
      setIsConnected(true);
      
      // Set signer and contracts
      const signer = provider.getSigner();
      setSigner(signer);
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TokenABI, signer);
      setTokenContract(tokenContract);
      
      // Get ETH balance
      const balance = await provider.getBalance(accounts[0]);
      setBalance(ethers.utils.formatEther(balance));
      
      toast.success('Wallet connected successfully');
      return accounts[0];
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
      return null;
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setBalance('0');
    setChainId(null);
    setSigner(null);
    setTokenContract(null);
    toast.success('Wallet disconnected');
  };

  const stakeTokens = async (amount: string): Promise<boolean> => {
    if (!tokenContract || !isConnected) {
      toast.error('Wallet not connected or contract not initialized');
      return false;
    }

    try {
      const parsedAmount = ethers.utils.parseEther(amount);
      const tx = await tokenContract.stake(parsedAmount);
      await tx.wait();
      toast.success(`Successfully staked ${amount} tokens`);
      return true;
    } catch (error: any) {
      console.error('Error staking tokens:', error);
      toast.error(error.message || 'Failed to stake tokens');
      return false;
    }
  };

  const unstakeTokens = async (amount: string): Promise<boolean> => {
    if (!tokenContract || !isConnected) {
      toast.error('Wallet not connected or contract not initialized');
      return false;
    }

    try {
      const parsedAmount = ethers.utils.parseEther(amount);
      const tx = await tokenContract.unstake(parsedAmount);
      await tx.wait();
      toast.success(`Successfully unstaked ${amount} tokens`);
      return true;
    } catch (error: any) {
      console.error('Error unstaking tokens:', error);
      toast.error(error.message || 'Failed to unstake tokens');
      return false;
    }
  };

  const getTokenBalance = async (): Promise<string> => {
    if (!tokenContract || !walletAddress) return '0';

    try {
      const balance = await tokenContract.balanceOf(walletAddress);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  };

  const value = {
    isConnected,
    walletAddress,
    balance,
    chainId,
    provider,
    signer,
    tokenContract,
    connectWallet,
    disconnectWallet,
    stakeTokens,
    unstakeTokens,
    getTokenBalance
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};