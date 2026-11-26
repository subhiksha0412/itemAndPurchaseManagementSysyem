
import { useEffect, useState } from "react";
import { getData } from "../services/api";
import DataTable from "../components/DataTable";
import SearchBar from "../components/SearchBar";
import StatusBadge from "../components/StatusBadge";

function Stock() {
    const [stock, setStock] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getData("/itemRoutes/stock")
            .then((result) => setStock(result.data || []))
            .catch((error) => alert(error.response?.data?.message || "Unable to load stock"));
    }, []);

    const filtered = stock.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { key: "id", label: "Item ID" },
        { key: "name", label: "Item Name" },
        { key: "type_name", label: "Item Type" },
        { key: "stock_available", label: "Available Stock" },
        {
            key: "stock_status",
            label: "Stock Status",
            render: (row) => (
                <StatusBadge
                    status={
                        row.stock_available === 0
                            ? "Out of Stock"
                            : row.stock_available <= 5
                            ? "Low Stock"
                            : "In Stock"
                    }
                />
            )
        }
    ];

    return (
        <>
            <h2>Stock Management</h2>
            <SearchBar value={search} onChange={setSearch} placeholder="Search stock..." />
            <DataTable columns={columns} data={filtered} />
        </>
    );
}

export default Stock;
