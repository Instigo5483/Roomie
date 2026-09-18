export type MemberBalance = { memberId: string; net: number };
export type SettlementTransaction = {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
};

const EPSILON = 0.01;

/**
 * Greedy debt-minimization: repeatedly matches the largest debtor against the
 * largest creditor until every balance settles to ~0. Produces at most n-1
 * transactions for n members with a non-zero balance, versus the O(n^2) that
 * "everyone pays everyone" would need.
 */
export function simplifyDebts(balances: MemberBalance[]): SettlementTransaction[] {
  const debtors = balances
    .filter((b) => b.net < -EPSILON)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.net - b.net);
  const creditors = balances
    .filter((b) => b.net > EPSILON)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net);

  const transactions: SettlementTransaction[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.net, creditor.net);

    if (amount > EPSILON) {
      transactions.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount: Math.round(amount * 100) / 100,
      });
      debtor.net += amount;
      creditor.net -= amount;
    }

    if (Math.abs(debtor.net) <= EPSILON) i++;
    if (Math.abs(creditor.net) <= EPSILON) j++;
  }

  return transactions;
}
