"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCode } from "react-qrcode-logo";
import { Smartphone } from "lucide-react";

export function PromptPayQrCode({ qrString }: { qrString?: string }) {
  return (
    <Dialog open={Boolean(qrString)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Scan to Pay
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-5 py-8">
          <div className="relative">
            {/* QR Code with thick black border */}
            <div className="bg-white p-6 rounded-3xl shadow-lg">
              <QRCode
                value={qrString ?? ""}
                ecLevel="H"
                qrStyle="dots"
                size={240}
                quietZone={0}
                eyeRadius={10}
              />
            </div>

            {/* PromptPay badge integrated below the QR */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <div className="bg-black text-white rounded-full px-6 py-3 flex items-center gap-3 shadow-lg border-4 border-white">
                <div className="bg-white rounded-full p-1.5">
                  <Smartphone className="h-5 w-5 text-black" />
                </div>
                <div className="flex items-center gap-5">
                  <span className="font-bold text-md">PromptPay</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Open your mobile banking app and scan to complete payment
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
