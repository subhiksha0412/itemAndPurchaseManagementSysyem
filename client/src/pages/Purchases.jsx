
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getData } from "../services/api";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import SearchBar from "../components/SearchBar";

function Purchases() {
    const [purchases, setPurchases] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getData("/purchaseRoutes")
            .then((result) => setPurchases(result.data || []))
            .catch((error) => alert(error.response?.data?.message || "Unable to load purchases"));
    }, []);

    const filtered = purchases.filter((purchase) =>
        String(purchase.order_id).toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { key: "id", label: "ID" },
        { key: "order_id", label: "Order ID" },
        { key: "purchase_date", label: "Purchase Date" },
        {
            key: "items",
            label: "Items",
            render: (row) => row.items?.length || 0
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <Link className="edit-btn" to={`/purchases/edit/${row.id}`}>
                    View / Edit
                </Link>
            )
        }
    ];

    return (
        <>
            <PageHeader
                title="Purchases"
                buttonText="+ New Purchase"
                onClick={() => window.location.href = "/purchases/add"}
            />
            <SearchBar value={search} onChange={setSearch} placeholder="Search order ID..." />
            <DataTable columns={columns} data={filtered} />
        </>
    );
}

export default Purchases;
