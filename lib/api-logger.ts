"use client";
import { saveLogs, getLogs, clearLogs } from "./indexed-db";

export type ApiLog = {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  requestBody?: any;
  response: any;
  status: number;
};

let apiLogs: ApiLog[] = [];

export async function logApiCall(
  method: string,
  url: string,
  response: any,
  status: number,
  requestBody?: any
) {
  console.log(method, url, response, status, requestBody, typeof window);
  const log: ApiLog = {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    method,
    url,
    requestBody,
    response,
    status,
  };
  apiLogs.push(log);
  // Keep only last 100 logs
  if (apiLogs.length > 100) {
    apiLogs.shift();
  }
  try {
    await saveLogs(apiLogs);
  } catch (err) {
    console.error("Failed to save logs to IndexedDB:", err);
  }
}

export async function getApiLogFromLocal() {
  try {
    apiLogs = await getLogs();
  } catch (err) {
    console.error("Failed to load logs from IndexedDB:", err);
  }
}

export async function getApiLogs(): Promise<ApiLog[]> {
  return apiLogs;
}

export async function clearApiLogs() {
  apiLogs.length = 0;
  try {
    await clearLogs();
  } catch (err) {
    console.error("Failed to clear logs from IndexedDB:", err);
  }
}
