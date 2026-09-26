export interface Payment {
  id: string;
  amount: string;
  payment_method?: { id: string; name: string } | string;
  payment_date: string;
}
