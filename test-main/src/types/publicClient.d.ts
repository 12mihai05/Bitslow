import { PublicCoin } from "./coin";
import { PublicTransaction } from "./transaction";

export interface PublicClient {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  coins?: PublicCoin[];
  clientTransactions?: PublicTransaction[];
  sellerTransactions?: PublicTransaction[];
}
