
import { useEffect, useState } from "react";
import { getData } from "../services/api";
import Loading from "../components/Loading";

function Dashboard() {
    const [counts, setCounts] = useState({
        items: 0,
        types: 0,
        purchases: 0,
        stock: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [items, types, purchases] = await Promise.all([
                    getData("/itemRoutes"),
                    getData("/itemTypeRoutes"),
                    getData("/purchaseRoutes")
                ]);

                const itemList = items.data || [];

                setCounts({
                    items: itemList.length,
                    types: (types.data || []).length,
                    purchases: (purchases.data || []).length,
                    stock: itemList.reduce(
                        (total, item) =>
                            total + Number(item.stock_available || 0),
                        0
                    )
                });
            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return <Loading />;
    }

    const cards = [
        { title: "Total Items", value: counts.items },
        { title: "Item Types", value: counts.types },
        { title: "Total Purchases", value: counts.purchases },
        { title: "Available Stock", value: counts.stock }
    ];

    return (
        <>
            <h2>Dashboard</h2>

            <div className="dashboard-grid">
                {cards.map((card) => (
                    <div className="dashboard-card" key={card.title}>
                        <p>{card.title}</p>
                        <h2>{card.value}</h2>
                    </div>
                ))}
            </div>

            <div className="welcome-card">
                <h3>Welcome to Item & Purchase Management System</h3>
                <p>
                    Manage your item types, items, purchases and stock in one place.
                </p>
            </div>
        </>
    );
}

export default Dashboard;
