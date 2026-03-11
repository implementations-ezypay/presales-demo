"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"

export function PromptPayQrCode({ qrString }: { qrString?: string }) {
  return (
    <Dialog open={Boolean(qrString)}>
      <DialogContent className="sm:max-w-2xl flex justify-center items-center ">
        <Image
          src="promptpay_qr_screen.png"
          alt="prompt-pay-qr-code"
          width={450}
          height={450}
        />

        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Open your mobile banking app and scan to complete payment
        </p>
      </DialogContent>
    </Dialog>
  )
}
