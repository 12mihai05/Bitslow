export interface TransactionQuery {
    page?: number;
    limit?: number;
    buyer?: string;
    seller?: string;
    minValue?: string;
    maxValue?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }