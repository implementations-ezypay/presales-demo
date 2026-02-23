"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const attendanceLogs = [
  { id: "1", date: "2024-10-14", time: "06:30 AM", class: "Yoga" },
  { id: "2", date: "2024-10-13", time: "05:00 PM", class: "CrossFit" },
  { id: "3", date: "2024-10-12", time: "07:00 AM", class: "Spinning" },
  { id: "4", date: "2024-10-11", time: "06:30 AM", class: "Yoga" },
]

export function AttendanceLog() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Logs</CardTitle>
          <CardDescription>Recent gym and class attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Class</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(attendanceLogs ?? []).map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.time}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.class}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
