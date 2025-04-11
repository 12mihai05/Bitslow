import { PublicClient } from "./publicClient";

export interface ProfileStats {
  transactions: number;
  coinsOwned: number;
  totalValue: number;
  client: PublicClient;
}
