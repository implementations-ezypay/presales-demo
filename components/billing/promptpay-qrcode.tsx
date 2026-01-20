"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QRCode } from "react-qrcode-logo";

export function PromptPayQrCode({ qrString }: { qrString?: string }) {
  return (
    <Dialog open={Boolean(qrString)}>
      <DialogContent className="sm:max-w-md flex justify-center items-center">
        <p>Prompt Pay</p>
        <QRCode
          value={qrString ?? ""}
          ecLevel="H"
          size={250}
          quietZone={20}
          eyeRadius={10}
        />
      </DialogContent>
    </Dialog>
  );
}
