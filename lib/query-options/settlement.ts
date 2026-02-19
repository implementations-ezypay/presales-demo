import { queryOptions } from "@tanstack/react-query"
import { listSettlements } from "../settlements"

export const listSettlementOptions = (branch: string | null) => {
  return queryOptions({
    queryKey: ["listSettlement", branch],
    queryFn: () => listSettlements(branch!),
    refetchOnWindowFocus: false,
    enabled: !!branch,
  })
}
