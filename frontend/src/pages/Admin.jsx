import { useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Inventory from "./admin/Inventory";
import MenuManagement from "./admin/MenuManagement";
import Orders from "./admin/Orders";

export default function Admin() {
  const [activePage, setActivePage] = useState("Dashboard");

  const pages = {
    Dashboard: <Dashboard onNavigate={setActivePage} />,
    Menu: <MenuManagement />,
    "Menu Management": <MenuManagement />,
    Inventory: <Inventory />,
    Orders: <Orders />,
  };

  return (
    <AdminLayout
      activePage={activePage}
      onNavigate={setActivePage}
    >
      {pages[activePage] || <Dashboard onNavigate={setActivePage} />}
    </AdminLayout>
  );
}