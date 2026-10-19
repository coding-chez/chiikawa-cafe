import { useState } from 'react'
import { Link } from 'react-router'
import { checkoutContent } from '../data/checkoutContent.js'
import { productImages } from '../data/homeAssets.js'
import { loadCompletedDemoOrder } from '../utils/demoCheckout.js'
import { formatCurrency } from '../utils/currency.js'
import useCart from '../hooks/useCart.js'

export default function OrderSuccessPage() {
  const [order] = useState(() => loadCompletedDemoOrder())
  const { checkoutPending } = useCart()
  const content = checkoutContent.success

  if (!order || checkoutPending) {
    return (
      <div className="content-width py-8 md:py-20">
        <section className="mx-auto max-w-[800px] rounded-[32px] bg-white px-5 py-12 text-center shadow-cafe md:px-12">
          <h1 className="text-3xl font-extrabold">{checkoutPending ? content.pendingTitle : content.noOrderTitle}</h1>
          <p className="mt-4 text-muted">{checkoutPending ? content.pendingDescription : content.noOrderDescription}</p>
          <Link to={checkoutPending ? '/cart' : '/menu'} className="button-primary mt-6">
            {checkoutPending ? content.reviewCart : content.back}
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="content-width py-6 md:py-16">
      <section aria-labelledby="order-success-heading"
        className="mx-auto max-w-[800px] rounded-[32px] bg-white px-5 py-8 shadow-cafe md:px-12 md:py-12">
        <img src={productImages['FOOD-001']} alt={content.illustrationAlt} width="180" height="160"
          className="mx-auto mb-7 h-40 w-44 object-contain" />
        <h1 id="order-success-heading" className="text-center text-[30px] leading-tight font-extrabold md:text-[40px]">{content.title}</h1>
        <p className="mt-4 text-center text-muted">{content.description}</p>
        <div className="mt-7 flex flex-col gap-4 border-b border-ink/15 pb-6 text-sm md:flex-row md:justify-between md:gap-8">
          <p className="flex shrink-0 items-center gap-2">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="size-5 rounded-full bg-cream text-muted"><path d="m6 12 4 4 8-9" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {content.placed}
          </p>
          <p className="min-w-0 text-muted">{content.reference}: <span data-order-reference className="[overflow-wrap:anywhere]">{order.id}</span></p>
        </div>
        <h2 className="mt-6 text-xl font-extrabold">{content.yourOrder}</h2>
        <ul className="mt-4 space-y-5 md:space-y-3">
          {order.items.map((item, index) => (
            <li key={index} className="flex flex-col gap-2 text-muted md:flex-row md:justify-between md:gap-6">
              <p>{item.name}<span className="md:hidden"> ×{item.quantity}</span></p>
              <p className="shrink-0 text-ink">{item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.getLineTotal())}</p>
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <p className="text-muted" data-order-item-count>{content.itemCount(order.getItemCount())}</p>
          <p className="flex items-center justify-between gap-4 text-xl font-bold">
            {content.total}<span data-order-total className="text-[34px] font-extrabold">{formatCurrency(order.getTotal())}</span>
          </p>
        </div>
        <Link to="/menu" className="button-primary mt-7 w-full md:mx-auto md:flex md:w-[280px]">{content.back}</Link>
        <p className="mt-6 text-center text-xs text-muted md:text-sm">{content.disclaimer}</p>
      </section>
    </div>
  )
}
