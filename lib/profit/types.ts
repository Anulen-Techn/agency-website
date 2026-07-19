import type { CurrencyCode } from "@/lib/invoice/types";

export type ProfitMode = "basic" | "advanced" | "target-price" | "target-profit" | "break-even";

export type ProfitInput = {
  mode: ProfitMode;
  currency: CurrencyCode;
  scenarioName: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  fixedExpenses: number;
  variableExpensePerItem: number;
  shipping: number;
  advertising: number;
  processingFee: number;
  tax: number;
  discount: number;
  otherExpenses: number;
  desiredMargin: number;
  desiredTotalProfit: number;
};

export type ProfitResult = {
  revenue: number;
  grossRevenue: number;
  discountAmount: number;
  netRevenue: number;
  productCost: number;
  variableExpenses: number;
  fixedExpenses: number;
  totalExpenses: number;
  totalCosts: number;
  grossProfit: number;
  netProfit: number;
  profitPerItem: number;
  profitMargin: number;
  markup: number;
  roi: number;
  breakEvenSellingPrice: number;
  contributionMargin: number;
  breakEvenQuantity: number;
  breakEvenRevenue: number;
  targetSellingPrice: number;
  targetQuantity: number;
  status: "Profit" | "Loss" | "Break even";
  interpretation: string;
  breakdown: Array<{ label: string; amount: number }>;
};

export type ProfitScenario = {
  id: string;
  input: ProfitInput;
  result: ProfitResult;
  createdAt: string;
};
