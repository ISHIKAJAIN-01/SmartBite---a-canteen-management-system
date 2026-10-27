import { useState, useEffect } from "react";
import "./App.css";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import MyOrders from "./pages/MyOrders";

const categories = ["Meals", "Drinks", "Snacks", "Desserts"];

function App() {
  const [activeCategory, setActiveCategory] = useState("Meals");

  const [cartType, setCartType] = useState(
    () => sessionStorage.getItem("smartbite-cart-type") || "meals_drinks"
  );

  const [currentPath, setCurrentPath] = useState(
    window.location.pathname
  );

  useEffect(() => {
    function handlePopState() {
      setCurrentPath(window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }

    setCurrentPath(path);
    window.scrollTo(0, 0);
  }

  function selectCategory(category) {
    setActiveCategory(category);

    const nextCartType =
      category === "Meals" || category === "Drinks"
        ? "meals_drinks"
        : "snacks_desserts";

    setCartType(nextCartType);
    sessionStorage.setItem("smartbite-cart-type", nextCartType);
  }

  // CART PAGE
  if (currentPath === "/cart") {
    return (
      <div className="app">
        <header className="header">
          <button
            type="button"
            className="brand"
            onClick={() => navigate("/")}
          >
            <span className="brand-icon">🍽️</span>
            <span>
              <strong>SmartBite</strong>
              <small>Campus Canteen</small>
            </span>
          </button>

          <button
            type="button"
            className="cart-button"
            onClick={() => navigate("/")}
          >
            Back to menu
          </button>
        </header>

        <Cart onNavigate={navigate} />

        <footer>SmartBite © 2026 · Made for campus life</footer>
      </div>
    );
  }

  // CHECKOUT PAGE
  if (currentPath === "/checkout") {
    return (
      <div className="app">
        <header className="header">
          <button
            type="button"
            className="brand"
            onClick={() => navigate("/")}
          >
            <span className="brand-icon">🍽️</span>
            <span>
              <strong>SmartBite</strong>
              <small>Campus Canteen</small>
            </span>
          </button>

          <button
            type="button"
            className="cart-button"
            onClick={() => navigate("/cart")}
          >
            Back to cart
          </button>
        </header>

        <Checkout onNavigate={navigate} />

        <footer>SmartBite © 2026 · Made for campus life</footer>
      </div>
    );
  }

  // ORDER CONFIRMATION PAGE
  if (currentPath === "/order-confirmation") {
    return (
      <div className="app">
        <header className="header">
          <button
            type="button"
            className="brand"
            onClick={() => navigate("/")}
          >
            <span className="brand-icon">🍽️</span>
            <span>
              <strong>SmartBite</strong>
              <small>Campus Canteen</small>
            </span>
          </button>
        </header>

        <OrderConfirmation onNavigate={navigate} />

        <footer>SmartBite © 2026 · Made for campus life</footer>
      </div>
    );
  }

  // MY ORDERS PAGE
  if (currentPath === "/my-orders") {
    return (
      <div className="app">
        <header className="header">
          <button
            type="button"
            className="brand"
            onClick={() => navigate("/")}
          >
            <span className="brand-icon">🍽️</span>
            <span>
              <strong>SmartBite</strong>
              <small>Campus Canteen</small>
            </span>
          </button>

          <button
            type="button"
            className="cart-button"
            onClick={() => navigate("/")}
          >
            Back to menu
          </button>
        </header>

        <MyOrders onNavigate={navigate} />

        <footer>SmartBite © 2026 · Made for campus life</footer>
      </div>
    );
  }

  // TEMPORARY MENU PAGE
  // Member 1's actual menu will be integrated here later.
  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-icon">🍽️</span>

          <div>
            <h1>SmartBite</h1>
            <p>Campus Canteen</p>
          </div>
        </div>

        <div className="header-actions">
          <span className="status">● Canteen Menu</span>

          <button
            type="button"
            className="cart-button"
            onClick={() => navigate("/cart")}
          >
            🛒 Cart
          </button>

          <button
            type="button"
            className="cart-button"
            onClick={() => navigate("/my-orders")}
          >
            My Orders
          </button>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <div>
            <p className="eyebrow">YOUR CAMPUS, YOUR FOOD</p>

            <h2>
              Good food.
              <br />
              <span>Less waiting.</span>
            </h2>

            <p className="hero-text">
              Order your favourites and make your campus break delicious.
            </p>
          </div>

          <div className="hero-art" aria-hidden="true">
            🥗
          </div>
        </section>

        <section className="menu-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FRESH & FAVOURITE</p>
              <h2>Explore the menu</h2>
            </div>

            <span className="menu-note">Choose a category</span>
          </div>

          <div className="categories">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={`category ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => selectCategory(category)}
              >
                {category === "Meals" && "🍛"}
                {category === "Drinks" && "🥤"}
                {category === "Snacks" && "🍿"}
                {category === "Desserts" && "🍰"}

                <span>{category}</span>
              </button>
            ))}
          </div>

          <div className="empty-menu">
            <span className="empty-icon">🍽️</span>
            <h3>{activeCategory}</h3>

            <p>
              Menu items will appear here once connected to the database.
            </p>
          </div>
        </section>

        <section className="cart-info">
          <div>
            <h3>Two carts, one easy experience</h3>
            <p>
              Meals & Drinks and Snacks & Desserts have separate checkouts.
            </p>
          </div>

          <span className="cart-type">
            Current category:{" "}
            {cartType === "meals_drinks"
              ? "Meals & Drinks"
              : "Snacks & Desserts"}
          </span>
        </section>
      </main>

      <footer>SmartBite © 2026 · Made for campus life</footer>
    </div>
  );
}

export default App;