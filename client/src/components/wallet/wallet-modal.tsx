import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/context/web3-context';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const walletIcons: { [key: string]: string } = {
  'MetaMask': 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
  'WalletConnect': 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg',
};

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectWithProvider, availableWalletProviders } = useWeb3();
  const { toast } = useToast();
  
  const [activatingProvider, setActivatingProvider] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Reset error message when modal opens/closes
  React.useEffect(() => {
    setErrorMessage(null);
  }, [isOpen]);

  const handleWalletConnect = async (name: string) => {
    setActivatingProvider(name);
    setErrorMessage(null);
    
    try {
      await connectWithProvider(name);
      onClose();
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      let message = error.message || 'Failed to connect wallet';
      
      if (message.includes('chain') || message.includes('network')) {
        message = 'Unsupported network. Please switch to Binance Smart Chain.';
      }
      
      setErrorMessage(message);
      setActivatingProvider(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet provider to continue
          </DialogDescription>
        </DialogHeader>
        
        {errorMessage && (
          <div className="bg-red-50 p-4 rounded-md mb-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="text-red-700 text-sm">{errorMessage}</div>
          </div>
        )}
        
        <div className="grid gap-3 py-4">
          {availableWalletProviders.map((name) => (
            <Button
              key={name}
              variant="outline"
              className="flex justify-between items-center h-14 px-4"
              disabled={activatingProvider === name}
              onClick={() => handleWalletConnect(name)}
            >
              <span className="font-medium">{name}</span>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                {activatingProvider === name ? (
                  <div className="h-4 w-4 border-2 border-t-transparent animate-spin rounded-full" />
                ) : (
                  <img 
                    src={walletIcons[name]} 
                    alt={`${name} logo`} 
                    className="h-5 w-5"
                    onError={(e) => {
                      e.currentTarget.src = 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg';
                    }}
                  />
                )}
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}