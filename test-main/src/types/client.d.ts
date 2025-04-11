export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  password_hash: string;
  bitSlowBalance: number;
  created_at: string;
}
