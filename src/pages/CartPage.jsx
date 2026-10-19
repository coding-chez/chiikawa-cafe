import { Link, useNavigate } from 'react-router'
import CartItemCard from '../components/cart/CartItemCard.jsx'
import { checkoutContent } from '../data/checkoutContent.js'
import { cartContent } from '../data/cartContent.js'
import { characterImages } from '../data/homeAssets.js'
import { formatCurrency } from '../utils/currency.js'
import useCart from '../hooks/useCart.js'

export default function CartPage() {
  const { cart, itemCount, subtotal, clearCart, placeDemoOrder,
    isCheckingOut, checkoutPending, checkoutError, pendingOrder } = useCart()
  const navigate = useNavigate()

  async function handleDemoOrder() {
    const order = await placeDemoOrder()
    if (order) navigate('/order-success')
  }

  return (
    <div className="content-width py-7 md:py-12">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4 md:mb-9">
        <div>
          <h1 className="text-[30px] leading-tight font-extrabold md:text-[44px]">{cartContent.title}</h1>
          <p className="mt-2 text-muted">{cartContent.subtitle}</p>
        </div>
        {itemCount > 0 && <button type="button" disabled={isCheckingOut || checkoutPending} onClick={clearCart}
          className="min-h-11 text-sm font-bold underline">{cartContent.clear}</button>}
      </header>

      {checkoutPending && (
        <p role="status" className="mb-6 rounded-2xl border border-ink/20 bg-white p-4 text-sm text-muted">
          {checkoutContent.recovery}
          {pendingOrder && <span className="mt-2 block font-bold [overflow-wrap:anywhere]">{pendingOrder.id}</span>}
        </p>
      )}
      {cart.items.length === 0 ? (
        <section aria-labelledby="empty-cart-heading" className="rounded-[28px] bg-white px-6 py-10 text-center shadow-cafe md:py-14">
          <img src={characterImages.Chiikawa} alt={cartContent.emptyImageAlt} width="120" height="120"
            className="mx-auto mb-6 size-30 object-contain" />
          <h2 id="empty-cart-heading" className="text-2xl font-extrabold">{cartContent.emptyTitle}</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">{cartContent.emptyDescription}</p>
          <Link to="/menu" className="button-primary mt-6">{cartContent.browse}</Link>
        </section>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] lg:gap-12">
          <div className="grid min-w-0 gap-6" aria-label={cartContent.items}>
            {cart.items.map((item) => <CartItemCard key={item.product.id} item={item} />)}
          </div>
          <section aria-labelledby="cart-summary-heading" className="min-w-0 rounded-[24px] bg-white p-5 shadow-cafe md:p-7">
            <h2 id="cart-summary-heading" className="text-[28px] leading-tight font-extrabold md:text-[32px]">{cartContent.summary}</h2>
            <dl className="mt-7 space-y-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted">{cartContent.items}</dt><dd data-cart-item-count>{itemCount}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">{cartContent.subtotal}</dt><dd data-cart-subtotal>{formatCurrency(subtotal)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">{cartContent.charges}</dt><dd>{formatCurrency(0)}</dd></div>
              <div className="flex items-center justify-between gap-4 border-t border-ink/15 pt-6">
                <dt className="text-lg font-bold">{cartContent.total}</dt>
                <dd className="text-[32px] leading-tight font-extrabold" data-cart-total>{formatCurrency(subtotal)}</dd>
              </div>
            </dl>
            <button type="button" disabled={itemCount === 0 || isCheckingOut} aria-busy={isCheckingOut}
              aria-describedby="checkout-note" onClick={handleDemoOrder}
              className="mt-7 min-h-13 w-full rounded-full bg-pink px-4 py-3 font-extrabold hover:bg-pink/75 disabled:opacity-60">
              {isCheckingOut ? checkoutContent.placing : checkoutPending ? checkoutContent.retry : cartContent.placeOrder}
            </button>
            <p id="checkout-note" role="status" className="mt-3 text-center text-xs text-muted">
              {isCheckingOut ? checkoutContent.placing : checkoutContent.ready}
            </p>
            {checkoutError && <p role="alert" data-checkout-error className="mt-4 rounded-xl border border-ink/20 bg-cream p-3 text-sm">{checkoutError}</p>}
            <Link to="/menu" className="mt-3 flex min-h-12 items-center justify-center text-center text-sm font-bold hover:underline">
              {cartContent.continueShopping}
            </Link>
            <p className="mt-5 text-xs text-muted">{cartContent.demo}</p>
          </section>
        </div>
      )}
    </div>
  )
}
