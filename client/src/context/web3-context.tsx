import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

// BSC Chain configuration
const BSC_CHAIN_ID = "0x38"; // 56 in decimal
const BSC_CHAIN_ID_NUMBER = 56;
const BSC_CHAIN_CONFIG = {
  chainId: BSC_CHAIN_ID,
  chainName: "Binance Smart Chain",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  rpcUrls: ["https://bsc-dataseed1.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com/"],
};

// Supported chain IDs
const supportedChainIds = [
  1, // Ethereum Mainnet
  56, // BSC Mainnet
  97, // BSC Testnet
  137, // Polygon Mainnet
  80001, // Polygon Mumbai Testnet
];

// RPC URLs for different networks
const RPC_URLS: { [chainId: number]: string } = {
  1: 'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213', // Public infura endpoint
  56: 'https://bsc-dataseed1.binance.org/',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  137: 'https://polygon-rpc.com',
  80001: 'https://rpc-mumbai.maticvigil.com',
};

// MetaMask and other injected wallets
export const injectedConnector = new InjectedConnector({ 
  supportedChainIds 
});

// WalletConnect
export const walletConnectConnector = new WalletConnectConnector({
  rpc: RPC_URLS,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
});

// Available connectors
export const connectors: { [name: string]: any } = {
  MetaMask: injectedConnector,
  WalletConnect: walletConnectConnector,
};

// BSC token contract address
const TOKEN_ADDRESS = "0xfa4C07636B53D868E514777B9d4005F1e9c6c40B";

// ABI for ERC20 token - minimal set for functionality we need
const ERC20_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  // Write functions
  "function transfer(address to, uint amount) returns (bool)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

// Define the audit service address
const AUDIT_SERVICE_ADDRESS = "0x8C56A47F7FBaCE1177fFe2cb54c7BD7aEF1f999C";

interface Web3ContextValue {
  isConnected: boolean;
  walletAddress: string | null;
  balance: string | null;
  chainId: string | null;
  isCorrectChain: boolean;
  provider: ethers.BrowserProvider | null;
  tokenContract: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  connectWithProvider: (providerName: string) => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  formatAmount: (amount: string, decimals?: number) => string;
  parseAmount: (amount: string, decimals?: number) => string;
  payForAudit: (amount: string) => Promise<string>;
  BSC_EXPLORER_URL: string;
  availableWalletProviders: string[];
  activeWalletProvider: string | null;
}

const Web3Context = createContext<Web3ContextValue | undefined>(undefined);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [decimals, setDecimals] = useState<number>(18); // Default to 18, will update when connected
  const [activeWalletProvider, setActiveWalletProvider] = useState<string | null>(null);
  const availableWalletProviders = Object.keys(connectors);
  const { toast } = useToast();
  
  const BSC_EXPLORER_URL = "https://bscscan.com";
  
  // Check if connected to the correct BSC chain
  const isCorrectChain = chainId === BSC_CHAIN_ID;

  // Initialize provider and check for existing connection
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            // In ethers v6, Web3Provider is now BrowserProvider
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const network = await web3Provider.getNetwork();
            const signer = await web3Provider.getSigner();
            const address = await signer.getAddress();
            const contract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
            const tokenDecimals = await contract.decimals();

            setProvider(web3Provider);
            setChainId(`0x${network.chainId.toString(16)}`);
            setWalletAddress(address);
            setTokenContract(contract);
            setIsConnected(true);
            setDecimals(tokenDecimals);
            
            // Fetch initial balance
            const tokenBalance = await contract.balanceOf(address);
            setBalance(tokenBalance.toString());
          }
        } catch (error) {
          console.error("Failed to check existing connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  // Set up event listeners for wallet events
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else if (accounts[0] !== walletAddress) {
          // User switched accounts
          setWalletAddress(accounts[0]);
          refreshBalance();
        }
      };

      const handleChainChanged = (newChainId: string) => {
        setChainId(newChainId);
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [walletAddress]);

  // Connect with specific wallet provider
  const connectWithProvider = async (providerName: string) => {
    if (!connectors[providerName]) {
      toast({
        title: "Connection Failed",
        description: `Provider ${providerName} not supported.`,
        variant: "destructive",
      });
      return;
    }

    try {
      let newProvider: ethers.BrowserProvider;
      
      if (providerName === "MetaMask") {
        if (typeof window.ethereum === "undefined") {
          toast({
            title: "Wallet Connection Failed",
            description: "MetaMask not detected. Please install MetaMask extension.",
            variant: "destructive",
          });
          return;
        }
        
        // Request accounts access
        await window.ethereum.request({ method: "eth_requestAccounts" });
        
        // Create ethers provider
        newProvider = new ethers.BrowserProvider(window.ethereum);
      } else if (providerName === "WalletConnect") {
        // For WalletConnect
        const connector = walletConnectConnector;
        
        // Reset the connector
        if (connector.walletConnectProvider) {
          connector.walletConnectProvider = undefined;
        }
        
        try {
          await connector.activate();
        } catch (error) {
          console.error("WalletConnect activation error:", error);
          toast({
            title: "Connection Failed",
            description: "Failed to connect with WalletConnect.",
            variant: "destructive",
          });
          return;
        }
        
        // Get provider from WalletConnect
        const provider = await connector.getProvider();
        newProvider = new ethers.BrowserProvider(provider);
      } else {
        toast({
          title: "Connection Failed",
          description: `Provider ${providerName} not implemented.`,
          variant: "destructive",
        });
        return;
      }
      
      // Get network, signer, and address
      const network = await newProvider.getNetwork();
      const networkChainId = `0x${network.chainId.toString(16)}`;
      
      // Switch to BSC if needed
      if (networkChainId !== BSC_CHAIN_ID) {
        try {
          if (providerName === "MetaMask" && window.ethereum) {
            // Switch chain for MetaMask
            try {
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: BSC_CHAIN_ID }],
              });
            } catch (switchError: any) {
              if (switchError.code === 4902) {
                try {
                  await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [BSC_CHAIN_CONFIG],
                  });
                } catch (addError) {
                  toast({
                    title: "Chain Configuration Failed",
                    description: "Could not add BSC to your wallet. Please add it manually.",
                    variant: "destructive",
                  });
                  return;
                }
              } else {
                toast({
                  title: "Chain Switch Failed",
                  description: "Failed to switch to BSC. Please switch manually in your wallet.",
                  variant: "destructive",
                });
                return;
              }
            }
          } else {
            toast({
              title: "Wrong Network",
              description: "Please switch to BSC network in your wallet.",
              variant: "destructive",
            });
            return;
          }
        } catch (error) {
          console.error("Network switch error:", error);
          toast({
            title: "Network Switch Failed",
            description: "Failed to switch to BSC network.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Get updated provider and signer after potential chain switch
      const signer = await newProvider.getSigner();
      const address = await signer.getAddress();
      
      // Create token contract instance
      const contract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
      const tokenDecimals = await contract.decimals();
      
      // Update all the states
      setProvider(newProvider);
      setChainId(`0x${network.chainId.toString(16)}`);
      setWalletAddress(address);
      setTokenContract(contract);
      setIsConnected(true);
      setDecimals(tokenDecimals);
      setActiveWalletProvider(providerName);
      
      // Get token balance
      const tokenBalance = await contract.balanceOf(address);
      setBalance(tokenBalance.toString());
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${providerName}: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error) {
      console.error(`Error connecting with ${providerName}:`, error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect with ${providerName}. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  // Connect wallet function (defaults to MetaMask for backward compatibility)
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast({
        title: "Wallet Connection Failed",
        description: "No Web3 wallet detected. Please install MetaMask or another Web3 wallet.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const network = await web3Provider.getNetwork();
      const networkChainId = `0x${network.chainId.toString(16)}`;

      // Check if we're on BSC, if not, try to switch
      if (networkChainId !== BSC_CHAIN_ID) {
        try {
          // Try to switch to BSC
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BSC_CHAIN_ID }],
          });
        } catch (switchError: any) {
          // If chain hasn't been added, try to add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [BSC_CHAIN_CONFIG],
              });
            } catch (addError) {
              toast({
                title: "Chain Configuration Failed",
                description: "Could not add BSC to your wallet. Please add it manually.",
                variant: "destructive",
              });
              return;
            }
          } else {
            toast({
              title: "Chain Switch Failed",
              description: "Failed to switch to BSC. Please switch manually in your wallet.",
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Get updated provider info after potential chain switch
      const updatedNetwork = await web3Provider.getNetwork();
      const signer = await web3Provider.getSigner();
      const address = await signer.getAddress();
      
      // Create token contract instance
      const contract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
      const tokenDecimals = await contract.decimals();
      
      // Update all the states
      setProvider(web3Provider);
      setChainId(`0x${updatedNetwork.chainId.toString(16)}`);
      setWalletAddress(address);
      setTokenContract(contract);
      setIsConnected(true);
      setDecimals(tokenDecimals);
      
      // Get token balance
      const tokenBalance = await contract.balanceOf(address);
      setBalance(tokenBalance.toString());
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setBalance(null);
    setProvider(null);
    setTokenContract(null);
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (tokenContract && walletAddress) {
      try {
        const tokenBalance = await tokenContract.balanceOf(walletAddress);
        setBalance(tokenBalance.toString());
      } catch (error) {
        console.error("Error refreshing balance:", error);
      }
    }
  };

  // Pay for audit service with BOB tokens
  const payForAudit = async (amount: string): Promise<string> => {
    if (!tokenContract || !walletAddress || !isCorrectChain) {
      throw new Error("Wallet not connected or not on BSC");
    }

    try {
      // Convert amount to wei - ethers v6 uses parseUnits directly
      const parsedAmount = ethers.parseUnits(amount, decimals);
      
      // Check balance - ethers v6 uses bigint instead of BigNumber
      const balanceBN = BigInt(balance || "0");
      if (parsedAmount > balanceBN) {
        throw new Error("Insufficient balance");
      }
      
      // Send payment transaction
      const tx = await tokenContract.transfer(AUDIT_SERVICE_ADDRESS, parsedAmount);
      await tx.wait();
      
      // Refresh balance after payment
      await refreshBalance();
      
      return tx.hash;
    } catch (error: any) {
      console.error("Error processing payment:", error);
      throw new Error(error.message || "Failed to process payment");
    }
  };

  // Format amount with proper decimals (for display)
  const formatAmount = (amount: string, overrideDecimals?: number) => {
    try {
      return ethers.formatUnits(amount, overrideDecimals || decimals);
    } catch (error) {
      return "0";
    }
  };

  // Parse amount to wei format (for contract interactions)
  const parseAmount = (amount: string, overrideDecimals?: number) => {
    try {
      return ethers.parseUnits(amount, overrideDecimals || decimals).toString();
    } catch (error) {
      return "0";
    }
  };

  const value: Web3ContextValue = {
    isConnected,
    walletAddress,
    balance,
    chainId,
    isCorrectChain,
    provider,
    tokenContract,
    connectWallet,
    connectWithProvider,
    disconnectWallet,
    refreshBalance,
    formatAmount,
    parseAmount,
    payForAudit,
    BSC_EXPLORER_URL,
    availableWalletProviders,
    activeWalletProvider,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
