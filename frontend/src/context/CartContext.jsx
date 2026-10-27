
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext(null);

const PREPARED_CART_KEY = "smartbite-prepared-cart";
const READY_CART_KEY = "smartbite-ready-cart";

function loadCart(key) {
  try {
    const savedCart = sessionStorage.getItem(key);
    const parsedCart = savedCart ? JSON.parse(savedCart) : [];
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [preparedCart, setPreparedCart] = useState(
    () => loadCart(PREPARED_CART_KEY)
  );

  const [readyToServeCart, setReadyToServeCart] = useState(
    () => loadCart(READY_CART_KEY)
  );

  // Persist prepared cart independently.
  useEffect(() => {
    sessionStorage.setItem(
      PREPARED_CART_KEY,
      JSON.stringify(preparedCart)
    );
  }, [preparedCart]);

  // Persist ready-to-serve cart independently.
  useEffect(() => {
    sessionStorage.setItem(
      READY_CART_KEY,
      JSON.stringify(readyToServeCart)
    );
  }, [readyToServeCart]);

  function addToCart(item) {
    const isReadyToServe = item.preparationType === "readyToServe";

    const setCart = isReadyToServe
      ? setReadyToServeCart
      : setPreparedCart;

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existingItem) {
        return currentCart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...currentCart,
        {
          ...item,
          quantity: 1,
          cancellationAllowed: isReadyToServe,
        },
      ];
    });
  }

  function removeFromCart(itemId, cartType) {
    const setCart =
      cartType === "readyToServe"
        ? setReadyToServeCart
        : setPreparedCart;

    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== itemId)
    );
  }

  function updateQuantity(itemId, quantity, cartType) {
    if (quantity <= 0) {
      removeFromCart(itemId, cartType);
      return;
    }

    const setCart =
      cartType === "readyToServe"
        ? setReadyToServeCart
        : setPreparedCart;

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  }

  // Clear only the cart that was successfully checked out.
  function clearCart(cartType) {
    if (cartType === "snacks_desserts" || cartType === "readyToServe") {
      setReadyToServeCart([]);
    } else {
      setPreparedCart([]);
    }
  }

  const value = {
    preparedCart,
    readyToServeCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }

  return context;
}
