import { mutationOptions, queryOptions } from "@tanstack/react-query"
import { downloadDocument, listSettlements } from "../settlements"
import { documentType } from "../types/settlement"

export const listSettlementOptions = (branch: string | null) => {
  return queryOptions({
    queryKey: ["listSettlement", branch],
    queryFn: () => listSettlements(branch!),
    refetchOnWindowFocus: false,
    enabled: !!branch,
  })
}

type DownloadReportInput = {
  settlementId: string
  docType: documentType
}

export const downloadSettlementReportOptions = (branch: string | null) => {
  return mutationOptions({
    mutationKey: ["downloadSettlementReport", branch],
    mutationFn: (data: DownloadReportInput) =>
      downloadDocument(data.settlementId, data.docType, branch!),
  })
}
