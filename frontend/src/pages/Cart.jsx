
import { useCart } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();

  const {
    preparedCart,
    readyToServeCart,
    removeFromCart,
    updateQuantity,
  } = useCart();

  function getSubtotal(items) {
    return items.reduce(
      (total, item) =>
        total +
        (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
  }

  function getItemId(item) {
    return item.id ?? item.item_id;
  }

  function handleCheckout(items, cartType) {
    if (items.length === 0) return;

    // Checkout reads this selected cart.
    sessionStorage.setItem("smartbite-cart", JSON.stringify(items));
    sessionStorage.setItem("smartbite-cart-type", cartType);

    navigate("/checkout");
  }

  function renderCartSection(title, items, cartType, cartLabel) {
    const subtotal = getSubtotal(items);

    return (
      <section className="cart-items" key={cartType}>
        <div className="cart-section-heading">
          <h3>{title}</h3>
          <span>
            {items.reduce(
              (total, item) => total + (Number(item.quantity) || 1),
              0
            )}{" "}
            items
          </span>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h3>This cart is empty</h3>
            <p>Add items from the menu to see them here.</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => navigate("/menu")}
            >
              Explore menu
            </button>
          </div>
        ) : (
          <>
            {items.map((item) => {
              const itemId = getItemId(item);
              const quantity = Number(item.quantity) || 1;
              const price = Number(item.price) || 0;

              return (
                <article
                  className="cart-item"
                  key={`${cartType}-${itemId}`}
                >
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
                    <h4>{item.name || item.item_name || "Menu item"}</h4>
                    <p className="cart-item-price">
                      ₹{price.toFixed(2)} each
                    </p>

                    <div className="quantity-controls">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        disabled={quantity <= 1}
                        onClick={() =>
                          updateQuantity(itemId, quantity - 1, cartType)
                        }
                      >
                        −
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() =>
                          updateQuantity(itemId, quantity + 1, cartType)
                        }
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
                      onClick={() => removeFromCart(itemId, cartType)}
                    >
                      Remove
                    </button>

                    {item.cancellationAllowed && (
                      <p className="text-xs text-green-700">
                        Order cancellation eligible
                      </p>
                    )}
                  </div>
                </article>
              );
            })}

            <div className="summary-total">
              <span>{cartLabel} subtotal</span>
              <strong>₹{subtotal.toFixed(2)}</strong>
            </div>

            <button
              type="button"
              className="primary-button checkout-button"
              onClick={() => handleCheckout(items, cartLabel)}
            >
              Checkout {cartLabel} →
            </button>
          </>
        )}
      </section>
    );
  }

  const total = getSubtotal(preparedCart) + getSubtotal(readyToServeCart);

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <p className="eyebrow">YOUR SELECTION</p>
          <h2>Your Cart</h2>
          <p>Your two cart types stay separate.</p>
        </div>

        <button
          type="button"
          className="continue-shopping"
          onClick={() => navigate("/menu")}
        >
          ← Back to menu
        </button>
      </div>

      <div className="cart-layout">
        <div className="flex flex-col gap-6">
          {renderCartSection(
            "Will Be Prepared",
            preparedCart,
            "prepared",
            "meals_drinks"
          )}

          {renderCartSection(
            "Ready to Serve — Snacks & Desserts",
            readyToServeCart,
            "readyToServe",
            "snacks_desserts"
          )}
        </div>

        <aside className="cart-summary">
          <h3>Combined Summary</h3>

          <div className="summary-row">
            <span>Will Be Prepared</span>
            <span>₹{getSubtotal(preparedCart).toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Ready to Serve</span>
            <span>₹{getSubtotal(readyToServeCart).toFixed(2)}</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Combined total</span>
            <strong>₹{total.toFixed(2)}</strong>
          </div>

          <p className="checkout-note">
            Each cart has its own checkout button above.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default Cart;
