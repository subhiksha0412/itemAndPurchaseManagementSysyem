
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getData, updateData } from "../services/api";
import PurchaseForm from "../components/PurchaseForm";

function EditPurchase() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [purchase, setPurchase] = useState(null);

    useEffect(() => {
        getData(`/purchaseRoutes/${id}`)
            .then((result) => setPurchase(result.data))
            .catch((error) => alert(error.response?.data?.message || "Unable to load purchase"));
    }, [id]);

    const handleSubmit = async (formData) => {
        try {
            await updateData(`/purchaseRoutes/${id}`, formData);
            alert("Purchase updated successfully. Stock adjusted.");
            navigate("/purchases");
        } catch (error) {
            alert(error.response?.data?.message || "Unable to update purchase");
        }
    };

    if (!purchase) return <p>Loading purchase...</p>;

    return (
        <>
            <h2>Edit Purchase</h2>
            <PurchaseForm
                initialData={purchase}
                onSubmit={handleSubmit}
                buttonText="Update Purchase"
            />
        </>
    );
}

export default EditPurchase;
