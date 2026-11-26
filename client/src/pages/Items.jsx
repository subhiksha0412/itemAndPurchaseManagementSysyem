
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getData, deleteData, updateData } from "../services/api";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import SearchBar from "../components/SearchBar";
import StatusBadge from "../components/StatusBadge";

function Items() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");

    const loadItems = async () => {
        try {
            const result = await getData("/itemRoutes");
            setItems(result.data || []);
        } catch (error) {
            alert(error.response?.data?.message || "Unable to load items");
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const removeItem = async (id) => {
        if (!window.confirm("Delete this item?")) return;

        try {
            await deleteData(`/itemRoutes/${id}`);
            alert("Item deleted");
            loadItems();
        } catch (error) {
            alert(error.response?.data?.message || "Unable to delete item");
        }
    };

    const toggleStatus = async (item) => {
        try {
            await updateData(`/itemRoutes/${item.id}`, {
                name: item.name,
                item_type_id: item.item_type_id,
                purchase_date: item.purchase_date?.slice(0, 10),
                stock_available: item.stock_available,
                active: !(item.active === true || item.active === 1)
            });

            loadItems();
        } catch (error) {
            alert(error.response?.data?.message || "Unable to update item status");
        }
    };

    const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Item Name" },
        { key: "type_name", label: "Item Type" },
        { key: "purchase_date", label: "Purchase Date" },
        { key: "stock_available", label: "Stock" },
        {
            key: "active",
            label: "Status",
            render: (row) => (
                <StatusBadge status={row.active === true || row.active === 1 ? "Active" : "Inactive"} />
            )
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="action-buttons">
                    <Link className="edit-btn" to={`/items/edit/${row.id}`}>Edit</Link>
                    <button className="secondary-btn" onClick={() => toggleStatus(row)}>
                        {row.active === true || row.active === 1 ? "Deactivate" : "Activate"}
                    </button>
                    <button className="danger-btn" onClick={() => removeItem(row.id)}>Delete</button>
                </div>
            )
        }
    ];

    return (
        <>
            <PageHeader title="Items" buttonText="+ Add Item" onClick={() => window.location.href = "/items/add"} />
            <SearchBar value={search} onChange={setSearch} placeholder="Search items..." />
            <DataTable columns={columns} data={filtered} />
        </>
    );
}

export default Items;
