
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import ItemTypes from "./pages/ItemTypes";
import Items from "./pages/Items";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import Purchases from "./pages/Purchases";
import AddPurchase from "./pages/AddPurchase";
import EditPurchase from "./pages/EditPurchase";
import Stock from "./pages/Stock";

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />

                    <Route path="/item-types" element={<ItemTypes />} />

                    <Route path="/items" element={<Items />} />
                    <Route path="/items/add" element={<AddItem />} />
                    <Route path="/items/edit/:id" element={<EditItem />} />

                    <Route path="/purchases" element={<Purchases />} />
                    <Route path="/purchases/add" element={<AddPurchase />} />
                    <Route path="/purchases/edit/:id" element={<EditPurchase />} />

                    <Route path="/stock" element={<Stock />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
