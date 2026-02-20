import { mutationOptions, queryOptions } from "@tanstack/react-query"
import { downloadDocument, listSettlements } from "../settlements"

export const listSettlementOptions = (branch: string | null) => {
  return queryOptions({
    queryKey: ["listSettlement", branch],
    queryFn: () => listSettlements(branch!),
    refetchOnWindowFocus: false,
    enabled: !!branch,
  })
}

export const downloadSettlementReportOptions = (branch: string | null) => {
  return mutationOptions({
    mutationKey: ["downloadSettlementReport", branch],
    mutationFn: (data) =>
      downloadDocument(data.settlementId, data.docType, branch!),
  })
}
