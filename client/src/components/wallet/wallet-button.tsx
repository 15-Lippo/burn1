import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet as WalletIcon, LogOut, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import WalletModal from './wallet-modal';
import { formatAddress } from '@/lib/web3-utils';
import { useWeb3 } from '@/context/web3-context';

export default function WalletButton() {
  const { 
    isConnected, 
    walletAddress, 
    disconnectWallet, 
    isCorrectChain,
    BSC_EXPLORER_URL,
    activeWalletProvider
  } = useWeb3();
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);

  // Handle wallet disconnect
  const handleDisconnect = () => {
    disconnectWallet();
  };

  // View address on block explorer
  const viewOnExplorer = () => {
    if (walletAddress) {
      window.open(`${BSC_EXPLORER_URL}/address/${walletAddress}`, '_blank');
    }
  };

  if (isConnected && walletAddress) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isCorrectChain ? "default" : "destructive"}
              className="gap-2"
            >
              <WalletIcon className="h-4 w-4" />
              {isCorrectChain ? formatAddress(walletAddress) : "Wrong Network"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Wallet: {activeWalletProvider || 'Connected'}</DropdownMenuLabel>
            {!isCorrectChain && (
              <DropdownMenuItem className="text-red-500">
                Please switch to BSC network
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={viewOnExplorer}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDisconnect}>
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  return (
    <>
      <Button onClick={() => setWalletModalOpen(true)}>
        <WalletIcon className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </>
  );
}