
import { useEffect, useState } from "react";
import { getData, postData, updateData, deleteData } from "../services/api";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import SearchBar from "../components/SearchBar";

function ItemTypes() {
    const [types, setTypes] = useState([]);
    const [typeName, setTypeName] = useState("");
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");

    const loadTypes = async () => {
        try {
            const result = await getData("/itemTypeRoutes");
            setTypes(result.data || []);
        } catch (error) {
            alert(error.response?.data?.message || "Unable to load item types");
        }
    };

    useEffect(() => {
        loadTypes();
    }, []);

    const saveType = async (e) => {
        e.preventDefault();

        try {
            if (editId) {
                await updateData(`/itemTypeRoutes/${editId}`, {
                    type_name: typeName
                });
                alert("Item type updated successfully");
            } else {
                await postData("/itemTypeRoutes", {
                    type_name: typeName
                });
                alert("Item type created successfully");
            }

            setTypeName("");
            setEditId(null);
            loadTypes();
        } catch (error) {
            alert(error.response?.data?.message || "Unable to save item type");
        }
    };

    const editType = (type) => {
        setEditId(type.id);
        setTypeName(type.type_name);
    };

    const removeType = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item type?")) return;

        try {
            await deleteData(`/itemTypeRoutes/${id}`);
            alert("Item type deleted");
            loadTypes();
        } catch (error) {
            alert(error.response?.data?.message || "Unable to delete item type");
        }
    };

    const filtered = types.filter((type) =>
        type.type_name.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { key: "id", label: "ID" },
        { key: "type_name", label: "Item Type" },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="action-buttons">
                    <button className="edit-btn" onClick={() => editType(row)}>Edit</button>
                    <button className="danger-btn" onClick={() => removeType(row.id)}>Delete</button>
                </div>
            )
        }
    ];

    return (
        <>
            <PageHeader title="Item Types" />

            <form className="inline-form" onSubmit={saveType}>
                <input
                    value={typeName}
                    onChange={(e) => setTypeName(e.target.value)}
                    placeholder="Enter item type"
                    required
                />
                <button className="primary-btn">
                    {editId ? "Update Type" : "Add Type"}
                </button>

                {editId && (
                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => {
                            setEditId(null);
                            setTypeName("");
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            <SearchBar value={search} onChange={setSearch} placeholder="Search item types..." />

            <DataTable columns={columns} data={filtered} />
        </>
    );
}

export default ItemTypes;
