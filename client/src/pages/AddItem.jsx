
import { useNavigate } from "react-router-dom";
import ItemForm from "../components/ItemForm";
import { postData } from "../services/api";

function AddItem() {
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        try {
            await postData("/itemRoutes", formData);
            alert("Item added successfully");
            navigate("/items");
        } catch (error) {
            alert(error.response?.data?.message || "Unable to add item");
        }
    };

    return (
        <>
            <h2>Add New Item</h2>
            <ItemForm onSubmit={handleSubmit} buttonText="Save Item" />
        </>
    );
}

export default AddItem;
