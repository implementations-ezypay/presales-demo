// Global branches configuration shared across frontend and backend
export interface Branch {
  id: string;
  name: string;
  country: string;
  currency: string;
}

export const BRANCHES: Branch[] = [
  { id: "main", name: "Main Branch", country: "AU", currency: "AUD" },
  { id: "branch2", name: "Branch 2", country: "AU", currency: "AUD" },
  { id: "TH", name: "TH Branch", country: "PH", currency: "THB" },
];

export function getBranchName(branchId: string): string {
  return BRANCHES.find((b) => b.id === branchId)?.name || branchId;
}

export function getBranchCurrency(branchId: string): string {
  return BRANCHES.find((b) => b.id === branchId)?.currency || "AUD";
}
