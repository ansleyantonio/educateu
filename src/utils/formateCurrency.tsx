function formatCurrency(
  amount: number | string,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  const num = Number(amount);
  if (isNaN(num)) return "Invalid Amount";

  // Decide format based on value
  if (Math.abs(num) >= 1_000_000) {
    // Use compact for million and above
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(num);
  } else {
    // Use normal formatting for < 1 million
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(num);
  }
}

export default formatCurrency;

/*
👉 How to use:
- Just give a number (money amount).
- It will show in short form (K = thousand, M = million).
- By default shows $ (USD), but you can change currency.

*/
