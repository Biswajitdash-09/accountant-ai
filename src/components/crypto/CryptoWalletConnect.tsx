import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, RefreshCw, Trash2, Star } from "lucide-react";
import { useCryptoWallets } from "@/hooks/useCryptoWallets";
import { formatDistanceToNow } from "date-fns";

export const CryptoWalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletType, setWalletType] = useState("metamask");
  const [blockchain, setBlockchain] = useState("ethereum");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { wallets, isLoading, connectWallet, disconnectWallet, setPrimaryWallet, syncPortfolio } = useCryptoWallets();

  const handleConnect = async () => {
    if (!walletAddress) return;
    
    await connectWallet.mutateAsync({
      walletAddress,
      walletType,
      blockchain,
    });
    
    setWalletAddress("");
    setIsDialogOpen(false);
  };

  const handleConnectMetaMask = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts[0]) {
          setWalletAddress(accounts[0]);
          setWalletType('metamask');
        }
      } catch (error) {
        console.error('MetaMask connection error:', error);
      }
    } else {
      alert('Please install MetaMask to connect your wallet');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Crypto Wallets
            </CardTitle>
            <CardDescription>Connect and manage your cryptocurrency wallets</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect Crypto Wallet</DialogTitle>
                <DialogDescription>
                  Connect your wallet to track your cryptocurrency portfolio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleConnectMetaMask}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect MetaMask
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or enter manually
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet-address">Wallet Address</Label>
                  <Input
                    id="wallet-address"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet-type">Wallet Type</Label>
                  <Select value={walletType} onValueChange={setWalletType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metamask">MetaMask</SelectItem>
                      <SelectItem value="walletconnect">WalletConnect</SelectItem>
                      <SelectItem value="coinbase">Coinbase Wallet</SelectItem>
                      <SelectItem value="trust">Trust Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blockchain">Blockchain</Label>
                  <Select value={blockchain} onValueChange={setBlockchain}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                      <SelectItem value="avalanche">Avalanche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleConnect}
                  disabled={!walletAddress || connectWallet.isPending}
                >
                  {connectWallet.isPending ? "Connecting..." : "Connect Wallet"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading wallets...</div>
        ) : wallets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No wallets connected. Click "Connect Wallet" to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm">
                      {wallet.wallet_address.slice(0, 6)}...{wallet.wallet_address.slice(-4)}
                    </span>
                    {wallet.is_primary && (
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {wallet.blockchain.toUpperCase()} • {wallet.wallet_type}
                    {wallet.last_synced_at && (
                      <> • Synced {formatDistanceToNow(new Date(wallet.last_synced_at), { addSuffix: true })}</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => syncPortfolio.mutate(wallet.id)}
                    disabled={syncPortfolio.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 ${syncPortfolio.isPending ? 'animate-spin' : ''}`} />
                  </Button>
                  {!wallet.is_primary && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPrimaryWallet.mutate(wallet.id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => disconnectWallet.mutate(wallet.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
