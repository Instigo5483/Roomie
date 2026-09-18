export type UpiLinkOptions = {
  payeeUpiId: string;
  payeeName: string;
  amount: number;
  note?: string;
};

/**
 * Builds a `upi://pay` deep link per the NPCI UPI linking spec. Supported by
 * Google Pay, PhonePe, Paytm, and most other Indian UPI apps — tapping it
 * opens the app with the amount and payee pre-filled.
 */
export function buildUpiLink({ payeeUpiId, payeeName, amount, note }: UpiLinkOptions): string {
  const params = new URLSearchParams({
    pa: payeeUpiId,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: "INR",
  });
  if (note) params.set("tn", note);
  return `upi://pay?${params.toString()}`;
}
