import Image from "next/image"
import { CreditCard, Building2 } from "lucide-react"
import { useTheme } from "next-themes"

interface PaymentMethodIconProps {
  type: string
  className?: string
  style?: {}
}

export function PaymentMethodIcon({ type, className = "h-6 w-16", style = {} }: PaymentMethodIconProps) {
  const { theme } = useTheme()
  const normalizedType = type?.toLowerCase() || ""

  if (normalizedType.includes("google")) {
    return (
      <Image
        src="/GPay_Acceptance_Mark_800.png"
        alt="Google Pay"
        width={100}
        height={60}
        className={className}
        style={{ objectFit: "contain", ...style }}
      />
    )
  }

  if (normalizedType.includes("apple")) {
    return (
      <Image
        src="/Apple_Pay_Mark_RGB_041619.svg"
        alt="Apple Pay"
        width={60}
        height={60}
        className={className}
        style={{ objectFit: "contain", ...style }}
      />
    )
  }

  // VISA
  if (normalizedType.includes("visa")) {
    return (
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
        alt="Visa"
        width={60}
        height={60}
        className={className}
        style={{ objectFit: "contain", ...style }}
      />
    )
  }

  // Mastercard
  if (normalizedType.includes("mastercard") || normalizedType.includes("master card")) {
    return (
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
        alt="Mastercard"
        width={32}
        height={32}
        className={className}
        style={{ objectFit: "contain", ...style }}
      />
    )
  }

  // AMEX
  if (normalizedType.includes("amex") || normalizedType.includes("american express")) {
    return (
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg"
        alt="American Express"
        width={32}
        height={32}
        className={className}
        style={{ objectFit: "contain", ...style }}
      />
    )
  }

  // PayTo
  if (normalizedType.includes("payto")) {
    const payToSrc = theme === "dark" ? "/PayTo_symbol-White-WEB.png" : "/PayTo_symbol-Black-WEB.png"
    return (
      <Image
        src={payToSrc}
        alt="PayTo"
        width={60}
        height={60}
        className={className}
        style={{ objectFit: "contain", ...style }}
      />
    )
  }

  //PromptPay
  if (normalizedType.includes("promptpay")) {
    return (
      <Image
        src="/PromptPay-logo.png"
        alt="PayTo"
        width={60}
        height={60}
        className={`${className} bg-white`}
        style={{ objectFit: "contain", ...style }}
      />
    )
  }

  if (normalizedType.includes("gcash")) {
    return (
      <Image
        src="https://cdn.brandfetch.io/idU5cKFAqi/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1764364200213"
        alt="GCash"
        width={30}
        height={30}
        //className={`${className} bg-white`}
        style={{ objectFit: "contain", ...style }}
      />
    )
  }

  // Generic bank icon for bank transfers or other bank-related methods
  if (normalizedType.includes("bank") || normalizedType.includes("transfer") || normalizedType.includes("bpay")) {
    return <Building2 className={className} />
  }

  // Default credit card icon
  return <CreditCard className={className} />
}
