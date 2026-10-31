
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'

function Search() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  function handleSearch(event) {
    event.preventDefault()

    if (searchTerm.trim()) {
      navigate('/menu', {
        state: { searchTerm: searchTerm.trim() },
      })
    } else {
      navigate('/menu')
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#968575]">
        SmartBite
      </p>

      <h1 className="text-4xl font-semibold text-[#382117]">
        Find Your Favourite Food
      </h1>

      <p className="mt-3 text-[#706052]">
        Search the canteen menu for meals, snacks, and drinks.
      </p>

      <form
        onSubmit={handleSearch}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <label className="flex flex-1 items-center gap-3 rounded-xl border border-[#E5D9C9] bg-white px-4 py-3">
          <SearchIcon size={20} className="text-[#968575]" />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Try dosa, burger, chai..."
            aria-label="Search for food"
            className="w-full bg-transparent text-[#382117] outline-none"
          />
        </label>

        <button
          type="submit"
          className="rounded-xl bg-[#382117] px-6 py-3 font-semibold text-white transition hover:bg-[#503325]"
        >
          Search
        </button>
      </form>

      <button
        type="button"
        onClick={() => navigate('/menu')}
        className="mt-6 text-sm font-semibold text-[#706052] underline"
      >
        Browse the full menu
      </button>
    </main>
  )
}

export default Search
