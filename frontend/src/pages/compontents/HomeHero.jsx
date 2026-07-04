import React from 'react'
import hp from './hp.png'

function HomeHero() {
  return (
    <section className="overflow-hidden rounded-3xl bg-linear-to-r from-blue-50 to-slate-100 px-6 py-10 shadow-sm sm:px-10 sm:py-14 lg:px-14">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Best products.
            <br />
            Best prices.
            <br />
            <span className="text-blue-600">Best experience.</span>
          </h1>

          <p className="mt-4 max-w-md text-sm uppercase tracking-[0.2em] text-slate-500">
            Discover quality essentials for every day.
          </p>

          <button className="mt-8 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700">
            Shop Now
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <img className='h-100' src={hp} alt="" />
        </div>
      </div>
    </section>
  )
}

export default HomeHero
