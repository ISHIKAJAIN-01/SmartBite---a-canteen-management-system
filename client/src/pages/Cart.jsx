import { useEffect, useState } from "react";
import "./Cart.css";

function Cart({ onNavigate }) {
  const [items, setItems] = useState([]);
  const [cartType, setCartType] = useState("meals_drinks");

  useEffect(() => {
    try {
      let savedItems = sessionStorage.getItem("smartbite-cart");
      let savedCartType = sessionStorage.getItem("smartbite-cart-type");

      // TEMPORARY TEST ITEM: remove this block after menu integration
      if (!savedItems) {
        const testItems = [
          {
            id: 1,
            name: "Test Sandwich",
            price: 80,
            quantity: 1,
            category: "Meals",
          },
        ];

        savedItems = JSON.stringify(testItems);
        savedCartType = "meals_drinks";

        sessionStorage.setItem("smartbite-cart", savedItems);
        sessionStorage.setItem("smartbite-cart-type", savedCartType);
      }

      const parsedItems = JSON.parse(savedItems);
      setItems(Array.isArray(parsedItems) ? parsedItems : []);

      if (savedCartType) {
        setCartType(savedCartType);
      }
    } catch (error) {
      console.error("Could not load cart:", error);
      setItems([]);
    }
  }, []);

  function saveItems(updatedItems) {
    setItems(updatedItems);
    sessionStorage.setItem("smartbite-cart", JSON.stringify(updatedItems));
  }

  function getItemId(item, index) {
    return item.id ?? item.item_id ?? `cart-item-${index}`;
  }

  function increaseQuantity(itemId) {
    const updatedItems = items.map((item, index) =>
      getItemId(item, index) === itemId
        ? { ...item, quantity: Number(item.quantity || 1) + 1 }
        : item
    );

    saveItems(updatedItems);
  }

  function decreaseQuantity(itemId) {
    const updatedItems = items
      .map((item, index) =>
        getItemId(item, index) === itemId
          ? { ...item, quantity: Number(item.quantity || 1) - 1 }
          : item
      )
      .filter((item) => Number(item.quantity || 0) > 0);

    saveItems(updatedItems);
  }

  function removeItem(itemId) {
    const updatedItems = items.filter(
      (item, index) => getItemId(item, index) !== itemId
    );

    saveItems(updatedItems);
  }

  function navigateTo(path) {
    if (typeof onNavigate === "function") {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  }

  function handleCheckout() {
    if (items.length === 0) return;

    sessionStorage.setItem("smartbite-cart", JSON.stringify(items));
    sessionStorage.setItem("smartbite-cart-type", cartType);

    navigateTo("/checkout");
  }

  const subtotal = items.reduce((total, item) => {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 1);

    return total + price * quantity;
  }, 0);

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <p className="eyebrow">YOUR SELECTION</p>
          <h2>Your Cart</h2>
          <p>Review your items before checkout.</p>
        </div>

        <button
          type="button"
          className="continue-shopping"
          onClick={() => navigateTo("/")}
        >
          ← Back to menu
        </button>
      </div>

      <div className="cart-layout">
        <section className="cart-items">
          <div className="cart-section-heading">
            <h3>Cart Items</h3>
            <span>
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add something delicious from the menu to get started.</p>

              <button
                type="button"
                className="primary-button"
                onClick={() => navigateTo("/")}
              >
                Explore menu
              </button>
            </div>
          ) : (
            items.map((item, index) => {
              const itemId = getItemId(item, index);
              const quantity = Number(item.quantity || 1);
              const price = Number(item.price || 0);

              return (
                <article className="cart-item" key={itemId}>
                  <div className="cart-item-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name || "Food item"}
                      />
                    ) : (
                      <span>🍽️</span>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <h4>{item.name || "Menu item"}</h4>
                    <p className="cart-item-price">
                      ₹{price.toFixed(2)} each
                    </p>

                    <div className="quantity-controls">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name || "item"} quantity`}
                        disabled={quantity <= 1}
                        onClick={() => decreaseQuantity(itemId)}
                      >
                        −
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        aria-label={`Increase ${item.name || "item"} quantity`}
                        onClick={() => increaseQuantity(itemId)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <strong>₹{(price * quantity).toFixed(2)}</strong>

                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => removeItem(itemId)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <aside className="cart-summary">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Cart type</span>
            <span>
              {cartType === "meals_drinks"
                ? "Meals & Drinks"
                : "Snacks & Desserts"}
            </span>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Pickup</span>
            <span>At canteen</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>
            <strong>₹{subtotal.toFixed(2)}</strong>
          </div>

          <button
            type="button"
            className="primary-button checkout-button"
            onClick={handleCheckout}
            disabled={items.length === 0}
          >
            Proceed to Checkout →
          </button>

          <p className="checkout-note">
            Review your order details before placing your order.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default Cart;