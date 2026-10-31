import { Link } from 'react-router-dom'
import { ArrowRight, Clock, ShoppingBag, Utensils } from 'lucide-react'

function Home() {
  return (
    <main className="flex-1">
      {/* Hero section */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 md:gap-16 md:py-24">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#968575]">
            Your college canteen, made easier
          </p>

          <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-[#382117] sm:text-6xl">
            Good food.
            <br />
            Less waiting.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-[#706052]">
            Order your campus favourites ahead of time and collect your meal
            from the canteen counter when it’s ready. Your next break just
            got easier.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 rounded-lg bg-[#382117] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#503325] focus:outline-none focus:ring-2 focus:ring-[#968575] focus:ring-offset-2"
            >
              Explore the menu
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg border border-[#D8C6B0] bg-white px-6 py-4 text-sm font-semibold text-[#382117] transition hover:bg-[#F2E6D1]"
            >
              Get started
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#706052]">
            <span className="inline-flex items-center gap-2">
              <Clock size={17} className="text-[#968575]" />
              Order ahead
            </span>

            <span className="inline-flex items-center gap-2">
              <ShoppingBag size={17} className="text-[#968575]" />
              Counter pickup
            </span>
          </div>
        </div>

        {/* Emoji illustration */}
        <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-3xl border border-[#E5D9C9] bg-[#EADCC3] p-8 sm:min-h-96 sm:p-12">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#F2E6D1]" />
          <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-[#F8F1E8]" />

          <div className="relative z-10 text-center">
            <span
              className="text-8xl sm:text-9xl"
              role="img"
              aria-label="Meal and drink"
            >
              🍛
            </span>

            <h2 className="mt-6 text-2xl font-semibold text-[#382117]">
              Your break, your favourites
            </h2>

            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#706052]">
              Find something delicious, place your order, and pick it up at
              your college canteen.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#D8C6B0] bg-[#F8F1E8] px-4 py-2 text-sm font-medium text-[#382117]">
              <Utensils size={16} />
              Made for campus life
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[#E5D9C9] bg-white/60">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#968575]">
              Simple and convenient
            </p>

            <h2 className="mt-3 text-3xl font-semibold text-[#382117]">
              Your meal in three steps
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-[#706052]">
              Spend less time deciding how to order and more time enjoying
              your campus break.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-[#E5D9C9] bg-white p-6">
              <span className="text-3xl" role="img" aria-label="Menu">
                📋
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[#382117]">
                1. Explore the menu
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#706052]">
                Browse the available meals, snacks, and drinks at your
                college canteen.
              </p>
            </article>

            <article className="rounded-2xl border border-[#E5D9C9] bg-white p-6">
              <span className="text-3xl" role="img" aria-label="Order">
                🛍️
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[#382117]">
                2. Place your order
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#706052]">
                Choose your favourites and submit your order ahead of pickup.
              </p>
            </article>

            <article className="rounded-2xl border border-[#E5D9C9] bg-white p-6">
              <span className="text-3xl" role="img" aria-label="Pickup">
                🍽️
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[#382117]">
                3. Collect at the counter
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#706052]">
                Head to the canteen counter when your order is ready.
              </p>
            </article>
          </div>

          <div className="mt-9 text-center">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 font-semibold text-[#382117] underline underline-offset-4 hover:text-[#503325]"
            >
              Browse the menu
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home