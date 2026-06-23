'use client'

const ProductPage = () => (
  <div className="min-h-screen bg-linear-to-br from-indigo-600 via-indigo-500 to-purple-600 flex flex-col items-center justify-center px-6">
    <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full translate-x-1/3 translate-y-1/3" />
    <div className="relative text-center max-w-sm">
      <div className="text-6xl mb-6">🎓</div>
      <h1 className="text-3xl font-bold text-white mb-3">Welcome back!</h1>
      <p className="text-indigo-200 mb-8">You already have access to the product.</p>
      <a
        href="#"
        className="inline-block bg-white text-indigo-700 font-bold py-4 px-8 rounded-2xl text-lg hover:bg-indigo-50 transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-900/30"
      >
        Go to Product →
      </a>
    </div>
  </div>
)

export default ProductPage
