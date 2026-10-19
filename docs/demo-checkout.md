# Demo checkout and recovery

This is a browser-only academic demo. No real purchase, payment, or customer
information is involved.

The shared Cart provider exposes placeDemoOrder(). A controller created once per
provider guards submissions synchronously, before React rerenders, and remembers
the completed Cart reference so a late duplicate event cannot replace its receipt.
The UI also disables the checkout button while processing.

## Storage sequence

1. Create an Order snapshot, or reuse an existing pending snapshot.
2. Write it to chiikawa-cafe-checkout-v1 as a recovery intent.
3. Save the confirmed Order with the existing orderStorage helper.
4. Persist an empty cart under chiikawa-cafe-cart-v1.
5. Remove the recovery intent.
6. Clear the React cart and navigate to Order Success.

React state is not cleared until every storage step succeeds. The original Cart
and CartItem instances are never mutated by checkout. Confirmed-order storage is
not deleted when clearing the cart.

## Failures and refresh

- If preparing or saving fails, selections remain in the Cart and an accessible
  error is shown. A durable intent, when available, keeps the same reference.
- If saving the empty cart fails, the saved order remains pending for the UI.
  The success page offers a return to Cart instead of a confirmation.
- If removing the intent fails after the cart was cleared, refresh rebuilds the
  pending selections from that intent. Edits and automatic cart writes stay
  paused, so recovery cannot overwrite the already-empty saved cart.
- Finish Demo Order retries the same snapshot and reference. Restore storage
  access and retry, or refresh after storage becomes available.
- Malformed receipt JSON shows No demo order found. A malformed recovery intent
  blocks checkout rather than discarding an unknown attempt; restore that saved
  recovery data before retrying.
- After completion, refresh restores the same Order and OrderItem methods.
  New cart additions start a new intent; they do not change the saved receipt.

This recovery protocol covers interrupted writes in the local demo; it is not a
backend transaction or a payment system.

## Checks

Run npm test, npm run lint, and npm run build. With npm run dev running, execute
npm run test:browser for the cart and checkout integration checks. The runner uses
installed Edge by default; CART_QA_BROWSER can select another Chromium executable.
Screenshots are written to a temporary QA directory printed by the runner.

Visual references are the local 05 – Order Success Desktop/Mobile exports.
Direct Figma access was unavailable. Final touch-device and visual sign-off
remain manual.
