import { characterImages } from '../../data/homeAssets.js'
import { homeContent } from '../../data/homeContent.js'

export default function CharacterTile({ category }) {
  const image = characterImages[category.mascot]
  return (
    <div className="flex aspect-[1.18] min-w-0 items-center justify-center rounded-[20px] p-3 md:p-5"
      style={{ backgroundColor: category.color }}>
      {image ? (
        <img src={image} alt={homeContent.accessibility.characterAlt(category.mascot)}
          width="300" height="300" className="h-full w-full object-contain" />
      ) : (
        <span className="text-center text-sm text-muted">{category.mascot}</span>
      )}
    </div>
  )
}
