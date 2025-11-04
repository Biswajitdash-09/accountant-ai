import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCryptoNFTs } from "@/hooks/useCryptoNFTs";
import { Image, Loader2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

export const NFTGallery = ({ walletId }: { walletId?: string }) => {
  const { nfts, isLoading, totalFloorValue } = useCryptoNFTs(walletId);
  const { formatCurrency } = useCurrencyFormatter();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>NFT Collection</span>
          {totalFloorValue > 0 && (
            <Badge variant="secondary">
              Floor Value: {formatCurrency(totalFloorValue)}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Your digital collectibles</CardDescription>
      </CardHeader>
      <CardContent>
        {nfts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No NFTs found. Sync your wallet to see your collection.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft: any) => (
              <div
                key={nft.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="aspect-square bg-muted relative">
                  {nft.image_url ? (
                    <img
                      src={nft.image_url}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <a
                    href={`https://opensea.io/assets/ethereum/${nft.token_address}/${nft.token_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 p-2 rounded-full"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm truncate">{nft.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{nft.collection}</div>
                  {nft.floor_price_usd && (
                    <div className="text-xs font-medium mt-1">
                      Floor: {formatCurrency(nft.floor_price_usd)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
