
import { useEffect, useState } from "react";
import { getData } from "../services/api";

function PurchaseForm({ initialData, onSubmit, buttonText }) {
    const [items, setItems] = useState([]);

    const [orderId, setOrderId] = useState(initialData?.order_id || "");
    const [purchaseDate, setPurchaseDate] = useState(
        initialData?.purchase_date?.slice(0, 10) || ""
    );

    const [lines, setLines] = useState(
        initialData?.items?.map((line) => ({
            item_id: String(line.item_id),
            quantity: String(line.quantity)
        })) || [{ item_id: "", quantity: "1" }]
    );

    useEffect(() => {
        getData("/itemRoutes")
            .then((result) => {
                setItems((result.data || []).filter(
                    (item) => item.active === true || item.active === 1
                ));
            })
            .catch(console.error);
    }, []);

    const updateLine = (index, field, value) => {
        setLines((previous) =>
            previous.map((line, i) =>
                i === index ? { ...line, [field]: value } : line
            )
        );
    };

    const addLine = () => {
        setLines((previous) => [
            ...previous,
            { item_id: "", quantity: "1" }
        ]);
    };

    const removeLine = (index) => {
        setLines((previous) => previous.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit({
            order_id: orderId,
            purchase_date: purchaseDate,
            items: lines.map((line) => ({
                item_id: Number(line.item_id),
                quantity: Number(line.quantity)
            }))
        });
    };

    return (
        <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Order ID</label>
                <input
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label>Purchase Date</label>
                <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    required
                />
            </div>

            <h3>Purchase Items</h3>

            {lines.map((line, index) => (
                <div className="purchase-line" key={index}>
                    <select
                        value={line.item_id}
                        onChange={(e) =>
                            updateLine(index, "item_id", e.target.value)
                        }
                        required
                    >
                        <option value="">Select Item</option>
                        {items.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name} (Stock: {item.stock_available})
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) =>
                            updateLine(index, "quantity", e.target.value)
                        }
                        required
                    />

                    <button
                        type="button"
                        className="danger-btn"
                        disabled={lines.length === 1}
                        onClick={() => removeLine(index)}
                    >
                        Remove
                    </button>
                </div>
            ))}

            <button type="button" className="secondary-btn" onClick={addLine}>
                + Add Item
            </button>

            <button type="submit" className="primary-btn">
                {buttonText}
            </button>
        </form>
    );
}

export default PurchaseForm;
