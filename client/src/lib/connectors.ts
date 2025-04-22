import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

// BSC Chain ID
export const BSC_CHAIN_ID = 56;

// Supported chain IDs - adding more networks for flexibility
const supportedChainIds = [
  1, // Ethereum Mainnet
  56, // BSC Mainnet
  97, // BSC Testnet
  137, // Polygon Mainnet
  80001, // Polygon Mumbai Testnet
];

// RPC URLs for different networks
const RPC_URLS: { [chainId: number]: string } = {
  1: 'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213', // Public Infura endpoint
  56: 'https://bsc-dataseed1.binance.org/',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  137: 'https://polygon-rpc.com',
  80001: 'https://rpc-mumbai.maticvigil.com',
};

// MetaMask and other injected wallets
export const injected = new InjectedConnector({ 
  supportedChainIds 
});

// WalletConnect
export const walletconnect = new WalletConnectConnector({
  rpc: RPC_URLS,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
});

export const connectorsByName: { [name: string]: any } = {
  'MetaMask': injected,
  'WalletConnect': walletconnect,
};

// Helper function to reset WalletConnect connector
export const resetWalletConnector = (connector: any) => {
  if (connector && connector instanceof WalletConnectConnector) {
    connector.walletConnectProvider = undefined;
  }
};