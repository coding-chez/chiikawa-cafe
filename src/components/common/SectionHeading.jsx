export default function SectionHeading({ id, title, description, className = '' }) {
  return (
    <div className={'space-y-3 text-center ' + className}>
      <h2 id={id} className="text-2xl leading-tight font-extrabold md:text-4xl">{title}</h2>
      <p className="text-sm text-muted md:text-base">{description}</p>
    </div>
  )
}
