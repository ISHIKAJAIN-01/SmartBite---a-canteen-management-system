
import { useCart } from '../context/CartContext.jsx'
import { useLocation } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import FoodCard from '../components/FoodCard'

const categories = [
    'All',
    'Meals',
    'Drinks',
    'Snacks',
    'Desserts',
    'My Favourites',
]

// Food image URLs. Items without a photo use their emoji in FoodCard.
const foodImages = {
    'Masala Dosa':
        'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=700&q=80',
    Burger:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
    Fries:
        'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80',
}

const menuItems = [
    // Meals
    { id: 1, name: 'Masala Dosa', price: 40, emoji: '🥞' },
    { id: 2, name: 'Rajma Chawal', price: 40, emoji: '🍛' },
    { id: 3, name: 'Chole Chawal', price: 40, emoji: '🍚' },
    { id: 4, name: 'Pav Bhaji', price: 40, emoji: '🍞' },
    { id: 5, name: 'Fried Rice', price: 40, emoji: '🍚' },
    { id: 6, name: 'Fried Rice + Manchurian', price: 60, emoji: '🥡' },
    { id: 7, name: 'Vada Pav', price: 30, emoji: '🍔' },
    { id: 8, name: 'Fries', price: 40, emoji: '🍟' },
    { id: 9, name: 'Peri Peri Fries', price: 60, emoji: '🍟' },
    { id: 10, name: 'Cheese Fries', price: 60, emoji: '🍟' },
    { id: 11, name: 'Chilli Potato', price: 40, emoji: '🥔' },
    { id: 12, name: 'Honey Chilli Potato', price: 45, emoji: '🥔' },
    { id: 13, name: 'Masala Idli', price: 40, emoji: '🥘' },
    { id: 14, name: 'Burger', price: 45, emoji: '🍔' },
    { id: 15, name: 'Grill Sandwich', price: 30, emoji: '🥪' },
    { id: 16, name: 'Cheese Grill Sandwich', price: 45, emoji: '🥪' },
    { id: 17, name: 'Aloo Patty', price: 12, emoji: '🥯' },
    { id: 18, name: 'Paneer Patty', price: 15, emoji: '🥯' },
    { id: 19, name: 'Veg Chowmein', price: 30, emoji: '🍜' },
    { id: 20, name: 'White Sauce Pasta', price: 50, emoji: '🍝' },
    { id: 21, name: 'Mixed Sauce Pasta', price: 50, emoji: '🍝' },
    { id: 22, name: 'Red Sauce Pasta', price: 45, emoji: '🍝' },
    { id: 23, name: 'Big Aloo Patty', price: 15, emoji: '🥯' },
    { id: 24, name: 'Big Paneer Patty', price: 25, emoji: '🥯' },
    { id: 25, name: 'Masala Maggi', price: 30, emoji: '🍜' },
    { id: 26, name: 'Vegetable Maggi', price: 35, emoji: '🍜' },
    { id: 27, name: 'Cheese Maggi', price: 40, emoji: '🍜' },
    { id: 28, name: 'Onion Tomato Maggi', price: 35, emoji: '🍜' },
    { id: 29, name: 'Cheese Burger', price: 75, emoji: '🍔' },
    { id: 30, name: 'Club Cheese Burger', price: 75, emoji: '🍔' },
    { id: 31, name: 'Red Sauce Pasta with Cheese', price: 60, emoji: '🍝' },
    { id: 32, name: 'White Sauce Pasta with Cheese', price: 65, emoji: '🍝' },
    { id: 33, name: 'Mixed Sauce Pasta with Cheese', price: 65, emoji: '🍝' },
    { id: 34, name: 'Chilli Paneer', price: 60, emoji: '🥘' },
    { id: 35, name: 'Chole Kulche', price: 40, emoji: '🫓' },
    { id: 36, name: 'Chole Bhature', price: 40, emoji: '🫓' },
    { id: 37, name: 'Plain Dosa', price: 35, emoji: '🥞' },
    { id: 38, name: 'Veg Masala Dosa', price: 50, emoji: '🥞' },
    { id: 39, name: 'Maharaja Masala Dosa', price: 60, emoji: '🥞' },
    { id: 40, name: 'Paneer Dosa', price: 60, emoji: '🥞' },
    { id: 41, name: 'Uttapam', price: 70, emoji: '🥞' },
    { id: 42, name: 'Pizza Uttapam', price: 120, emoji: '🍕' },
    { id: 43, name: 'Idli Sambhar', price: 30, emoji: '🥘' },
    { id: 44, name: 'Veg Kathi Roll', price: 50, emoji: '🌯' },
    { id: 45, name: 'Aloo Tikki Kathi Roll', price: 60, emoji: '🌯' },
    { id: 46, name: 'Paneer Kathi Roll', price: 70, emoji: '🌯' },
    { id: 47, name: 'Peri Peri Cheese Kathi Roll', price: 80, emoji: '🌯' },
    { id: 48, name: 'Chilli Paneer Kathi Roll', price: 80, emoji: '🌯' },
    { id: 49, name: 'Soya Kathi Roll', price: 70, emoji: '🌯' },
    { id: 50, name: 'Chilli Chowmein Kathi Roll', price: 70, emoji: '🌯' },
    { id: 51, name: 'Lachha Paratha', price: 50, emoji: '🫓' },
    { id: 52, name: 'Malabar Paratha', price: 25, emoji: '🫓' },
    { id: 53, name: 'Aloo Paratha', price: 25, emoji: '🫓' },
    { id: 54, name: 'Gobi Paratha', price: 30, emoji: '🫓' },
    { id: 55, name: 'Aloo Pyaz Paratha', price: 30, emoji: '🫓' },
    { id: 56, name: 'Mix Veg Paratha', price: 40, emoji: '🫓' },
    { id: 57, name: 'Paneer Paratha', price: 40, emoji: '🫓' },
    { id: 58, name: 'Mix Cheese Paratha', price: 55, emoji: '🫓' },
    { id: 59, name: 'Pizza Pocket', price: 20, emoji: '🥟' },
    { id: 60, name: 'Pizza Puff', price: 20, emoji: '🥐' },
    { id: 61, name: 'Garlic Bread', price: 40, emoji: '🍞' },
    { id: 62, name: 'Aloo Tikki Sub', price: 80, emoji: '🥪' },
    { id: 63, name: 'Aloo Tikki Sub with Cheese', price: 95, emoji: '🥪' },

    // Bottled drinks
    { id: 64, name: 'Coke (250 ml)', price: 20, emoji: '🥤' },
    { id: 65, name: 'Coke (750 ml)', price: 40, emoji: '🥤' },
    { id: 66, name: 'Thums Up (250 ml)', price: 20, emoji: '🥤' },
    { id: 67, name: 'Thums Up (750 ml)', price: 40, emoji: '🥤' },
    { id: 68, name: 'Sprite (250 ml)', price: 20, emoji: '🥤' },
    { id: 69, name: 'Sprite (750 ml)', price: 40, emoji: '🥤' },
    { id: 70, name: 'Limca (250 ml)', price: 20, emoji: '🥤' },
    { id: 71, name: 'Limca (750 ml)', price: 40, emoji: '🥤' },
    { id: 72, name: 'Fanta (250 ml)', price: 20, emoji: '🥤' },
    { id: 73, name: 'Fanta (750 ml)', price: 40, emoji: '🥤' },
    { id: 74, name: 'Maaza (200 ml)', price: 20, emoji: '🧃' },
    { id: 75, name: 'Minute Maid (500 ml)', price: 10, emoji: '🧃' },
    { id: 76, name: 'Minute Maid (1 litre)', price: 20, emoji: '🧃' },
    { id: 77, name: 'Dasani Water (500 ml)', price: 10, emoji: '💧' },
    { id: 78, name: 'Dasani Water (1 litre)', price: 20, emoji: '💧' },

    // Drinks prepared when ordered
    { id: 79, name: 'Chai', price: 12, emoji: '☕' },
    { id: 80, name: 'Masala / Aadrak Chai', price: 15, emoji: '☕' },
    { id: 81, name: 'Cold Coffee', price: 50, emoji: '🧋' },
    // Desserts
    { id: 82, name: 'Chocolate Brownie', price: 60, emoji: '🍫' },
    { id: 83, name: 'Chocolate Pastry', price: 50, emoji: '🍰' },
    { id: 84, name: 'Black Forest Pastry', price: 60, emoji: '🍰' },
    { id: 85, name: 'Red Velvet Pastry', price: 70, emoji: '🍰' },
    { id: 86, name: 'Pineapple Pastry', price: 50, emoji: '🍰' },
    { id: 87, name: 'Butterscotch Pastry', price: 60, emoji: '🍰' },
    { id: 88, name: 'Chocolate Donut', price: 50, emoji: '🍩' },
    { id: 89, name: 'Glazed Donut', price: 40, emoji: '🍩' },
    { id: 90, name: 'Strawberry Donut', price: 50, emoji: '🍩' },
    { id: 91, name: 'Oreo Donut', price: 60, emoji: '🍩' },
].map((item) => {
    const isBottledDrink = item.id >= 64 && item.id <= 78
    const isMadeToOrderDrink = item.id >= 79 && item.id <= 81
    const isDessert = item.id >= 82 && item.id <= 91

    const category = isDessert
        ? 'Desserts'
        : isBottledDrink
            ? 'Snacks'
            : isMadeToOrderDrink
                ? 'Drinks'
                : 'Meals'

    const preparationType =
        category === 'Snacks' ? 'readyToServe' : 'prepared'

    return {
        ...item,
        image: foodImages[item.name],
        category,
        preparationType,
        cancellationAllowed: preparationType === 'readyToServe',
        description: 'Available at your college canteen.',
        available: true,
    }
})

function Menu() {
    const [activeCategory, setActiveCategory] = useState('All')
    const [availability, setAvailability] = useState({})
    const [databaseItemIds, setDatabaseItemIds] = useState({})
    const [likesByItemId, setLikesByItemId] = useState({})
    const [favouritesByItemId, setFavouritesByItemId] = useState({})
    const [notice, setNotice] = useState('')

    const location = useLocation()

    const [searchTerm, setSearchTerm] = useState(
        location.state?.searchTerm || ''
    )

    const {
        preparedCart,
        readyToServeCart,
        addToCart,
    } = useCart()

    // Fetch menu availability and actual database IDs
    useEffect(() => {
        async function fetchAvailability() {
            try {
                const response = await fetch(
                    'http://localhost:5001/api/menu'
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch menu availability')
                }

                const items = await response.json()

                const availabilityMap = {}
                const itemIdMap = {}

                items.forEach((item) => {
                    availabilityMap[item.name] = Boolean(item.available)
                    itemIdMap[item.name] = item.id
                })

                setDatabaseItemIds(itemIdMap)
                setAvailability(availabilityMap)
            } catch (error) {
                console.error('Error fetching menu availability:', error)
            }
        }

        fetchAvailability()
    }, [])

    // Fetch existing likes and current student's like status
    useEffect(() => {
        async function fetchLikes() {
            const token = localStorage.getItem('token')

            if (!token) return

            try {
                const response = await fetch(
                    'http://localhost:5001/api/product-likes',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch product likes')
                }

                const likes = await response.json()
                const likesMap = {}

                likes.forEach((like) => {
                    likesMap[like.item_id] = {
                        likeCount: like.likeCount,
                        isLiked: like.isLiked,
                    }
                })

                setLikesByItemId(likesMap)
            } catch (error) {
                console.error('Error fetching product likes:', error)
            }
        }

        fetchLikes()
    }, [])

    // Fetch only this student's favourites
    useEffect(() => {
        async function fetchFavourites() {
            const token = localStorage.getItem('token')

            if (!token) return

            try {
                const response = await fetch(
                    'http://localhost:5001/api/favorites',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch favourites')
                }

                const favourites = await response.json()
                const favouritesMap = {}

                favourites.forEach((favourite) => {
                    favouritesMap[favourite.item_id] = true
                })

                setFavouritesByItemId(favouritesMap)
            } catch (error) {
                console.error('Error fetching favourites:', error)
            }
        }

        fetchFavourites()
    }, [])

    // Like or unlike a product
    async function handleToggleLike(item) {
        const token = localStorage.getItem('token')
        const databaseId = databaseItemIds[item.name]

        if (!token) {
            setNotice('Please log in to like a product.')
            return
        }

        if (!databaseId) {
            setNotice('Menu data is still loading. Please try again.')
            return
        }

        const currentLike = likesByItemId[databaseId] || {
            likeCount: 0,
            isLiked: false,
        }

        try {
            const response = await fetch(
                `http://localhost:5001/api/product-likes/${databaseId}`,
                {
                    method: currentLike.isLiked ? 'DELETE' : 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Could not update like')
            }

            setLikesByItemId((previous) => ({
                ...previous,
                [databaseId]: {
                    likeCount: data.likeCount,
                    isLiked: data.isLiked,
                },
            }))
        } catch (error) {
            console.error('Like update failed:', error)
            setNotice(error.message)
        }
    }

    // Add or remove a product from favourites
    async function handleToggleFavourite(item) {
        const token = localStorage.getItem('token')
        const databaseId = databaseItemIds[item.name]

        if (!token) {
            setNotice('Please log in to add favourites.')
            return
        }

        if (!databaseId) {
            setNotice('Menu data is still loading. Please try again.')
            return
        }

        const isFavourite = Boolean(favouritesByItemId[databaseId])

        try {
            const response = await fetch(
                `http://localhost:5001/api/favorites/${databaseId}`,
                {
                    method: isFavourite ? 'DELETE' : 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Could not update favourite')
            }

            setFavouritesByItemId((previous) => {
                const updated = { ...previous }

                if (data.isFavourite) {
                    updated[databaseId] = true
                } else {
                    delete updated[databaseId]
                }

                return updated
            })
        } catch (error) {
            console.error('Favourite update failed:', error)
            setNotice(error.message)
        }
    }

    // Add product to cart
    function handleAddToCart(item) {
        const databaseId = databaseItemIds[item.name]

        if (!databaseId) {
            setNotice('Menu data is still loading. Please try again.')
            return
        }

        addToCart({
            ...item,
            item_id: databaseId,
        })

        setNotice(
            item.preparationType === 'readyToServe'
                ? `${item.name} added to your Ready to Serve cart.`
                : `${item.name} added to your Will Be Prepared cart.`
        )
    }

    // Filter menu items and sort by most liked
    const filteredItems = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()

        const filtered = menuItems.filter((item) => {
            const databaseId = databaseItemIds[item.name]

            const isFavourite = Boolean(
                favouritesByItemId[databaseId]
            )

            const matchesCategory =
                activeCategory === 'All' ||
                (activeCategory === 'My Favourites'
                    ? isFavourite
                    : item.category === activeCategory)

            const matchesSearch =
                item.name.toLowerCase().includes(query)

            const hasAvailabilityData =
                Object.keys(availability).length > 0

            const isAvailable =
                !hasAvailabilityData ||
                availability[item.name] === true

            return isAvailable && matchesCategory && matchesSearch
        })

        // Highest like count first
        return filtered.sort((a, b) => {
            const likesA =
                likesByItemId[databaseItemIds[a.name]]?.likeCount ?? 0

            const likesB =
                likesByItemId[databaseItemIds[b.name]]?.likeCount ?? 0

            return likesB - likesA
        })
    }, [
        activeCategory,
        searchTerm,
        availability,
        likesByItemId,
        favouritesByItemId,
        databaseItemIds,
    ])

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 md:px-8">

            {/* Page Header */}
            <section className="mb-10">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#968575]">
                    Your College Canteen
                </p>

                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-4xl font-semibold text-[#382117] md:text-5xl">
                            Explore the Menu
                        </h1>

                        <p className="mt-3 max-w-2xl leading-7 text-[#706052]">
                            Browse your campus favourites, order ahead, and collect your
                            food from the canteen counter.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl border border-[#E5D9C9] bg-white px-4 py-3 text-[#382117] sm:flex-row sm:gap-6">
                        <div>
                            <p className="text-sm font-semibold">
                                Will Be Prepared
                            </p>

                            <p className="text-xs text-[#706052]">
                                {preparedCart.reduce(
                                    (total, item) => total + item.quantity,
                                    0
                                )} items
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold">
                                Ready to Serve
                            </p>

                            <p className="text-xs text-[#706052]">
                                {readyToServeCart.reduce(
                                    (total, item) => total + item.quantity,
                                    0
                                )} items
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories and Search */}
            <section className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setActiveCategory(category)}
                            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${activeCategory === category
                                ? 'bg-[#382117] text-white'
                                : 'border border-[#E5D9C9] bg-white text-[#706052] hover:bg-[#F2E6D1]'
                                }`}
                        >
                            {category === 'My Favourites' && '♥ '}
                            {category}
                        </button>
                    ))}
                </div>

                <label className="flex w-full items-center gap-3 rounded-xl border border-[#E5D9C9] bg-white px-4 py-3 md:max-w-sm">
                    <Search
                        size={19}
                        className="shrink-0 text-[#968575]"
                    />

                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search food or drinks..."
                        aria-label="Search menu"
                        className="w-full bg-transparent text-sm text-[#382117] outline-none placeholder:text-[#968575]"
                    />
                </label>
            </section>

            {/* Notification */}
            {notice && (
                <p
                    role="status"
                    className="mb-5 rounded-lg bg-[#EADCC3] px-4 py-3 text-sm text-[#382117]"
                >
                    {notice}
                </p>
            )}

            {/* Menu Count */}
            <p className="mb-5 text-sm text-[#706052]">
                Showing {filteredItems.length}{' '}
                {filteredItems.length === 1 ? 'item' : 'items'}
                {activeCategory === 'My Favourites' && ' in your favourites'}
            </p>

            {/* Food Cards */}
            {filteredItems.length > 0 ? (
                <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredItems.map((item) => {
                        const databaseId = databaseItemIds[item.name]

                        const likeData = likesByItemId[databaseId] || {
                            likeCount: 0,
                            isLiked: false,
                        }

                        const isFavourite = Boolean(
                            favouritesByItemId[databaseId]
                        )

                        return (
                            <FoodCard
                                key={item.id}
                                item={{
                                    ...item,
                                    likeCount: likeData.likeCount,
                                    isLiked: likeData.isLiked,
                                    isFavourite,
                                }}
                                onAddToCart={handleAddToCart}
                                onToggleLike={handleToggleLike}
                                onToggleFavourite={handleToggleFavourite}
                            />
                        )
                    })}
                </section>
            ) : (
                <section className="rounded-2xl border border-dashed border-[#E5D9C9] bg-white px-6 py-16 text-center">
                    <p className="text-lg font-semibold text-[#382117]">
                        {activeCategory === 'My Favourites'
                            ? 'No favourites yet 🔖'
                            : 'No matching items found'}
                    </p>

                    <p className="mt-2 text-sm text-[#706052]">
                        {activeCategory === 'My Favourites'
                            ? 'Bookmark products using the separate favourite button and they will appear here.'
                            : 'Try another search or select a different category.'}
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            setSearchTerm('')
                            setActiveCategory('All')
                        }}
                        className="mt-5 rounded-lg bg-[#382117] px-5 py-3 text-sm font-semibold text-white hover:bg-[#503325]"
                    >
                        Explore Menu
                    </button>
                </section>
            )}
        </main>
    )
}

export default Menu
