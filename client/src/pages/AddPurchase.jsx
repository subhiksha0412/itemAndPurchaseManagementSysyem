
import { useNavigate } from "react-router-dom";
import PurchaseForm from "../components/PurchaseForm";
import { postData } from "../services/api";

function AddPurchase() {
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        try {
            await postData("/purchaseRoutes", formData);
            alert("Purchase created successfully. Stock updated.");
            navigate("/purchases");
        } catch (error) {
            alert(error.response?.data?.message || "Unable to create purchase");
        }
    };

    return (
        <>
            <h2>Create Purchase</h2>
            <PurchaseForm onSubmit={handleSubmit} buttonText="Save Purchase" />
        </>
    );
}

export default AddPurchase;
