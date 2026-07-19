import type { ProfitInput, ProfitResult } from "@/lib/profit/types";

export const roundMoney = (value: number) => Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
const positive = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);
const percent = (value: number, base: number) => (base > 0 ? (value / base) * 100 : 0);
const safeDivide = (value: number, base: number) => (base > 0 ? value / base : 0);

export function calculateProfit(input: ProfitInput): ProfitResult {
  const quantity = positive(input.quantity);
  const costPrice = positive(input.costPrice);
  const sellingPrice = positive(input.sellingPrice);
  const grossRevenue = roundMoney(sellingPrice * quantity);
  const discountAmount = roundMoney(Math.min(positive(input.discount), grossRevenue));
  const netRevenue = roundMoney(Math.max(grossRevenue - discountAmount, 0));
  const productCost = roundMoney(costPrice * quantity);
  const variableExpenses = roundMoney(positive(input.variableExpensePerItem) * quantity + positive(input.processingFee) + positive(input.tax));
  const fixedExpenses = roundMoney(positive(input.fixedExpenses) + positive(input.shipping) + positive(input.advertising) + positive(input.otherExpenses));
  const totalExpenses = roundMoney(variableExpenses + fixedExpenses);
  const totalCosts = roundMoney(productCost + totalExpenses);
  const grossProfit = roundMoney(netRevenue - productCost);
  const netProfit = roundMoney(netRevenue - totalCosts);
  const profitPerItem = roundMoney(safeDivide(netProfit, quantity));
  const profitMargin = percent(netProfit, netRevenue);
  const markup = percent(profitPerItem, costPrice);
  const totalInvestment = roundMoney(productCost + totalExpenses);
  const roi = percent(netProfit, totalInvestment);
  const totalCostPerItem = costPrice + positive(input.variableExpensePerItem) + safeDivide(fixedExpenses + positive(input.processingFee) + positive(input.tax), quantity);
  const contributionMargin = roundMoney(sellingPrice - costPrice - positive(input.variableExpensePerItem));
  const breakEvenQuantity = contributionMargin > 0 ? Math.ceil(fixedExpenses / contributionMargin) : 0;
  const breakEvenRevenue = roundMoney(breakEvenQuantity * sellingPrice);
  const breakEvenSellingPrice = roundMoney(totalCostPerItem);
  const desiredMargin = Math.min(Math.max(positive(input.desiredMargin), 0), 99.99) / 100;
  const targetSellingPrice = desiredMargin < 1 ? roundMoney(totalCostPerItem / (1 - desiredMargin)) : 0;
  const targetQuantity = contributionMargin > 0 ? Math.ceil((fixedExpenses + positive(input.desiredTotalProfit)) / contributionMargin) : 0;
  const status = netProfit > 0 ? "Profit" : netProfit < 0 ? "Loss" : "Break even";
  const interpretation =
    status === "Profit"
      ? `You earn ${roundMoney(profitPerItem).toLocaleString()} profit per item and your net profit margin is ${roundMoney(profitMargin)}%.`
      : status === "Loss"
        ? `Your current selling price produces a loss of ${roundMoney(Math.abs(profitPerItem)).toLocaleString()} per item.`
        : "Your revenue currently matches your estimated costs.";

  return {
    revenue: netRevenue,
    grossRevenue,
    discountAmount,
    netRevenue,
    productCost,
    variableExpenses,
    fixedExpenses,
    totalExpenses,
    totalCosts,
    grossProfit,
    netProfit,
    profitPerItem,
    profitMargin,
    markup,
    roi,
    breakEvenSellingPrice,
    contributionMargin,
    breakEvenQuantity,
    breakEvenRevenue,
    targetSellingPrice,
    targetQuantity,
    status,
    interpretation,
    breakdown: [
      { label: "Product cost", amount: productCost },
      { label: "Variable expenses", amount: variableExpenses },
      { label: "Fixed expenses", amount: fixedExpenses },
      { label: "Shipping", amount: positive(input.shipping) },
      { label: "Advertising", amount: positive(input.advertising) },
      { label: "Processing fees", amount: positive(input.processingFee) },
      { label: "Tax", amount: positive(input.tax) },
      { label: "Other costs", amount: positive(input.otherExpenses) },
    ].filter((item) => item.amount > 0),
  };
}
