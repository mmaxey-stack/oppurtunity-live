/**
 * Appends the signed-in user to a Stripe Payment Link so Checkout sessions
 * include `client_reference_id` and prefill the customer email.
 * @see https://docs.stripe.com/payment-links/payment-methods
 */
export function appendPaymentLinkContext(urlString: string, userId: string, email: string | null) {
  const u = new URL(urlString);
  u.searchParams.set("client_reference_id", userId);
  if (email) {
    u.searchParams.set("prefilled_email", email);
  }
  return u.toString();
}
