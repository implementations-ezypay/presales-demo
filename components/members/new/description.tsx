import Link from "next/link"

export const CreateCustomerPageDescription = () => (
  <>
    <br></br>
    <p className="text-sm text-muted-foreground italic">
      You would want to&nbsp;
      <Link
        href={"https://developer.ezypay.com/docs/customer-creation#/"}
        target="_blank"
        className="underline"
      >
        create customer with Ezypay
      </Link>
      &nbsp;also at this step. The next step will be collecting payment methods
      from customer and an Ezypay customer ID is required. It you have a
      disjoined process on customer creation and payment method collecton, you
      could create the customer later.
    </p>
  </>
)

export const PaymentCapturePageDescription = () => (
  <>
    <br></br>
    <p className="text-sm text-muted-foreground italic">
      After you get the Ezypay customer ID, you could collect the payment method
      from customer by&nbsp;
      <Link
        href={"https://developer.ezypay.com/docs/payment-capture-page#/"}
        target="_blank"
        className="underline"
      >
        hosting Ezypay's Payment capture page
      </Link>
      &nbsp;as an iframe in your page. You could also email this page to
      customer for them to fill in their payment method.
    </p>
  </>
)
