"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, Search, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import {
  downloadSettlementReportOptions,
  listSettlementOptions,
} from "@/lib/query-options/settlement"
import { documentType, Settlement } from "@/lib/types/settlement"
import { parseCurrency } from "@/lib/utils"
import { toast } from "sonner"

export function SettlementTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [branch, setBranch] = useState("")

  useEffect(() => {
    const selectedBranch = localStorage.getItem("selectedBranch") || "main"
    setBranch(selectedBranch)
  }, [])

  const { data: settlements, isPending }: UseQueryResult<Settlement[]> =
    useQuery(listSettlementOptions(branch))

  const filteredSettlements = settlements?.filter((settlement) => {
    const matchesSearch =
      settlement.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      settlement.date.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch && settlement.amount.value !== 0
  })

  const downloadDocumentMutation = useMutation({
    ...downloadSettlementReportOptions(branch),
    onSuccess: (data) => {
      const downloadUrl = data
      window.open(downloadUrl, "_blank")
      toast.success("Your document should be downloading automatically")
    },
  })

  const handleDownloadDocument = async (
    settlementId: string,
    docType: documentType
  ) => {
    downloadDocumentMutation.mutate({ settlementId, docType })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement History</CardTitle>
        <CardDescription>
          View and download past settlement reports
        </CardDescription>
        <CardDescription className="italic">
          This page allows merchant to quickly check their&nbsp;
          <Link
            href={
              "https://developer.ezypay.com/docs/reports-1#retrieve-settlement-reports"
            }
            target="_blank"
            className="underline"
          >
            settlement summary
          </Link>
          &nbsp;and allows them to download the settlement report.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by settlement ID or period..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Settlement ID</TableHead>
              <TableHead>Settlement Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading settlements...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSettlements?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No settlements found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSettlements?.map((settlement) => (
                <TableRow key={settlement.number}>
                  <TableCell className="font-medium">
                    {settlement.number}
                  </TableCell>
                  <TableCell>{settlement.date}</TableCell>
                  <TableCell className="font-medium">
                    {parseCurrency(settlement.amount.value)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{settlement.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          disabled={downloadDocumentMutation.isPending}
                        >
                          <Download className="h-4 w-4" />
                          {downloadDocumentMutation.isPending
                            ? "Downloading..."
                            : "Download Report"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleDownloadDocument(
                              settlement.number,
                              "detail_report"
                            )
                          }
                        >
                          Tax Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleDownloadDocument(
                              settlement.number,
                              "detail_report"
                            )
                          }
                        >
                          Detail Report
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleDownloadDocument(
                              settlement.number,
                              "summary_report"
                            )
                          }
                        >
                          Summary Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
