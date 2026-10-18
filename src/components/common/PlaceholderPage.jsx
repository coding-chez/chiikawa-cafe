import { siteContent } from '../../data/siteContent.js'

export default function PlaceholderPage({ content }) {
  return (
    <section className="rounded-xl border border-beige bg-white p-6">
      <p className="text-sm text-muted">{siteContent.milestone}</p>
      <h1 className="mt-2 text-3xl font-extrabold">{content.title}</h1>
      <p className="mt-4 text-muted">{content.description}</p>
    </section>
  )
}
