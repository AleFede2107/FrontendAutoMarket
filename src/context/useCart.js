import { useContext } from 'react'
import { CartContext } from './cartContext.js'

function useCart() {
  const cart = useContext(CartContext)

  if (!cart) {
    throw new Error('useCart debe utilizarse dentro de CartProvider.')
  }

  return cart
}

export { useCart }
