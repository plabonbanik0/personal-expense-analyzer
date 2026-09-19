export type CategoryType = "expense" | "income";
export type PaymentMethod =
  "cash" | "card" | "bank_transfer" | "mobile_payment" | "other";
export type TransactionType = "expense" | "income";
export type Frequency = "daily" | "weekly" | "monthly" | "yearly";
export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
}
export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  user_id: number | null;
}
export interface Expense {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  description: string | null;
  expense_date: string;
  payment_method: PaymentMethod;
}
export interface Income {
  id: number;
  user_id: number;
  amount: string;
  source: string;
  income_date: string;
  description: string | null;
}
export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  month: number;
  year: number;
}
export interface RecurringTransaction {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  transaction_type: TransactionType;
  frequency: Frequency;
  next_date: string;
  is_active: boolean;
}
export interface AnalyticsSummary {
  total_expenses: string;
  total_income: string;
  remaining_balance: string;
  savings: string;
  transaction_count: number;
  average_transaction_amount: string;
  largest_expense: string | null;
  budget_utilization: string | null;
}
export interface CategoryTotal {
  category_id: number;
  category_name: string;
  total: string;
  percentage: string;
}
export interface MonthlyTotal {
  year: number;
  month: number;
  total: string;
}
export interface MonthlyComparison {
  current_total: string;
  previous_total: string;
  absolute_change: string;
  percentage_change: string | null;
}
export interface ApiError {
  detail?: string | string[];
}
