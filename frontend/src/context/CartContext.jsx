import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [preparedCart, setPreparedCart] = useState([])
  const [readyToServeCart, setReadyToServeCart] = useState([])

  function addToCart(item) {
    const isReadyToServe = item.preparationType === 'readyToServe'

    const cart = isReadyToServe ? readyToServeCart : preparedCart
    const setCart = isReadyToServe
      ? setReadyToServeCart
      : setPreparedCart

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (cartItem) => cartItem.id === item.id
      )

      if (existingItem) {
        return currentCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }

      return [...currentCart, { ...item, quantity: 1 }]
    })
  }

  function removeFromCart(itemId, cartType) {
    const setCart =
      cartType === 'readyToServe'
        ? setReadyToServeCart
        : setPreparedCart

    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== itemId)
    )
  }

  function updateQuantity(itemId, quantity, cartType) {
    const setCart =
      cartType === 'readyToServe'
        ? setReadyToServeCart
        : setPreparedCart

    if (quantity <= 0) {
      removeFromCart(itemId, cartType)
      return
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  const value = {
    preparedCart,
    readyToServeCart,
    addToCart,
    removeFromCart,
    updateQuantity,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used inside a CartProvider')
  }

  return context
}
