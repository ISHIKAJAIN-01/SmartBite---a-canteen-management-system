
import { Plus, Heart, Bookmark } from 'lucide-react'

function FoodCard({
  item,
  onAddToCart,
  onToggleLike,
  onToggleFavourite,
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E5D9C9] bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg">

      {/* Food Image */}
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#F2E6D1]">
        <span
          className="text-7xl"
          role="img"
          aria-label={item.name}
        >
          {item.emoji || '🍽️'}
        </span>

        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="absolute inset-0 z-10 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        )}
      </div>

      {/* Food Details */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#382117]">
            {item.name}
          </h2>

          <span className="shrink-0 rounded-full bg-[#F8F1E8] px-3 py-1 text-xs text-[#706052]">
            {item.category}
          </span>
        </div>

        <p className="mt-2 min-h-10 text-sm leading-5 text-[#706052]">
          {item.description || 'Freshly prepared at your college canteen.'}
        </p>

        {/* Price, Like, Favourite and Add to Cart */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

          {/* Price */}
          <span className="text-xl font-bold text-[#382117]">
            ₹{item.price}
          </span>

          <div className="flex items-center gap-2">

            {/* Like Button */}
            <button
              type="button"
              onClick={() => onToggleLike?.(item)}
              aria-label={item.isLiked ? 'Unlike product' : 'Like product'}
              aria-pressed={!!item.isLiked}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${
                item.isLiked
                  ? 'bg-red-50 text-red-600'
                  : 'bg-[#F8F1E8] text-[#706052] hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart
                size={19}
                fill={item.isLiked ? 'currentColor' : 'none'}
              />
              <span className="text-sm font-semibold">
                {item.likeCount ?? 0}
              </span>
            </button>

            {/* Favourite Button */}
            <button
              type="button"
              onClick={() => onToggleFavourite?.(item)}
              aria-label={
                item.isFavourite
                  ? 'Remove from favourites'
                  : 'Add to favourites'
              }
              aria-pressed={!!item.isFavourite}
              className={`rounded-lg p-2.5 transition ${
                item.isFavourite
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-[#F8F1E8] text-[#706052] hover:bg-amber-50 hover:text-amber-600'
              }`}
            >
              <Bookmark
                size={19}
                fill={item.isFavourite ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={() => onAddToCart(item)}
            disabled={!item.available}
            className="flex items-center gap-2 rounded-lg bg-[#382117] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#503325] disabled:cursor-not-allowed disabled:bg-[#968575]"
          >
            <Plus size={16} />
            {item.available ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default FoodCard
