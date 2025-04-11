export interface BaseTransaction {
	id: number;
	amount: number;
	transaction_date: string;
	bit1: number;
	bit2: number;
	bit3: number;
	value: number;
	hash: string;
}

export interface Transaction extends BaseTransaction {
	coin_id: number;
	seller_id: number;
	seller_name: string;
	buyer_id: number;
	buyer_name: string;
}

export interface PublicTransaction extends BaseTransaction {
	seller_name: string;
	buyer_name: string;
}
