
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ItemForm from "../components/ItemForm";
import { getData, updateData } from "../services/api";

function EditItem() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);

    useEffect(() => {
        getData(`/itemRoutes/${id}`)
            .then((result) => setItem(result.data))
            .catch((error) => {
                alert(error.response?.data?.message || "Unable to load item");
            });
    }, [id]);

    const handleSubmit = async (formData) => {
        try {
            await updateData(`/itemRoutes/${id}`, formData);
            alert("Item updated successfully");
            navigate("/items");
        } catch (error) {
            alert(error.response?.data?.message || "Unable to update item");
        }
    };

    if (!item) return <p>Loading item...</p>;

    return (
        <>
            <h2>Edit Item</h2>
            <ItemForm
                initialData={item}
                onSubmit={handleSubmit}
                buttonText="Update Item"
            />
        </>
    );
}

export default EditItem;
