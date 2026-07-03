import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, ShoppingCart, Smartphone, Link, Footprints, Apple, User } from 'lucide-react'
import HomeHeader from './HomeComponents/HomeHeader'
import HomeHero from './HomeComponents/HomeHero'
import HomeCategories from './HomeComponents/HomeCategories'
import HomeSearchModal from './HomeComponents/HomeSearchModal'
import ProductCard from './HomeComponents/ProductCard'
import FeaturedProduncts from './HomeComponents/Products/FeaturedProducts'

function Home() {
  const [activePage, setActivePage] = useState('home')
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchData, setSearchData] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:8001/api/auth/currentuser', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setUser(response.data)
      } catch (error) {
        localStorage.removeItem('token')
        navigate('/login')
      }
    }

    fetchUser()
  }, [navigate])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8001/api/product/all');
        console.log(response.request.response);
        setSearchData(response.request.response)
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAccountMenuOpen(false)
    navigate('/login')
  }

  const searchItems = useMemo(() => {
    const staticItems = [
    ];

    let productsList = [];
    if (Array.isArray(searchData)) {
      productsList = searchData;
    } else if (typeof searchData === 'string' && searchData.trim() !== '') {
      try {
        productsList = JSON.parse(searchData);
      } catch (e) {
        console.error('Error parsing searchData:', e);
      }
    }

    const dynamicItems = productsList.map((product) => ({
      title: product.name || '',
      subtitle: product.description || '',
      category: product.category || 'Product',
      status: product.price ? `₹${product.price}` : 'In Stock',
      icon: ShoppingBag,
      image: product.image || null,
      isProduct: true,
      productId: product._id
    }));

    return [...staticItems, ...dynamicItems];
  }, [searchData]);

  const products = useMemo(() => {
    let list = [];
    if (Array.isArray(searchData)) {
      list = searchData;
    } else if (typeof searchData === 'string' && searchData.trim() !== '') {
      try {
        list = JSON.parse(searchData);
      } catch (e) {
        console.error('Error parsing searchData:', e);
      }
    }
    return list;
  }, [searchData]);



  useEffect(() => {
    const handleKeyDown = (event) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'

      if (isShortcut) {
        event.preventDefault()
        setIsSearchOpen((prevValue) => !prevValue)
        return
      }

      if (event.key === 'Escape') {
        setIsSearchOpen(false)
        setIsAccountMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])


  const pages = {
    home: (
      <>
        <HomeHero />

        {/* Featured Products */}
        {/* <section className="mt-16">
          <div className="flex flex-col gap-1 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl tracking-tight">Featured Products</h2>
            <p className="text-sm text-slate-500">Explore our curated selection of premium arrivals</p>
          </div>

          {products.length === 0 ? (
            <div className="py-16 text-center text-slate-450 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <ShoppingBag className="w-12 h-12 text-slate-350 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-700">No products available</p>
              <p className="text-xs text-slate-500 mt-1">Check back later or register products via Admin Panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id || product.name} product={product} />
              ))}
            </div>
          )}
        </section> */}
        <FeaturedProduncts products={products}/>
      </>
    ),
    shop: (
      <div className="py-12 text-center text-xl font-medium text-slate-500">
        Shop Section
      </div>
    ),
    categories: (
      <div className="py-12 text-center text-xl font-medium text-slate-500">
        Categories Section
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className={isSearchOpen ? 'pointer-events-none select-none blur-sm brightness-75 transition duration-200' : 'transition duration-200'}>
        <HomeHeader
          user={user}
          isAccountMenuOpen={isAccountMenuOpen}
          onToggleAccount={() => setIsAccountMenuOpen((prevValue) => !prevValue)}
          onLogout={handleLogout}
          onSearchToggle={() => setIsSearchOpen((prevValue) => !prevValue)}
          activePage={activePage}
          onPageChange={setActivePage}
        />

        <main className="mx-3 px-3 pb-12 sm:mx-6 sm:px-6 lg:mx-10 lg:px-8">
          {pages[activePage]}
        </main>
      </div>

      <HomeSearchModal
        isOpen={isSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        items={searchItems}
        onClose={() => {
          setIsSearchOpen(false)
          setSearchQuery('')
        }}
      />
    </div>
  )
}

export default Home
