
import { useEffect, useState } from "react";
import { getData } from "../services/api";
import FormInput from "./FormInput";

function ItemForm({ initialData, onSubmit, buttonText }) {
    const [types, setTypes] = useState([]);
    const [form, setForm] = useState({
        name: initialData?.name || "",
        item_type_id: initialData?.item_type_id || "",
        purchase_date: initialData?.purchase_date?.slice(0, 10) || "",
        stock_available: initialData?.stock_available ?? 0,
        active: initialData?.active ?? true
    });

    useEffect(() => {
        getData("/itemTypeRoutes")
            .then((result) => setTypes(result.data || []))
            .catch((error) => console.error(error));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: name === "stock_available" ? value : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit({
            ...form,
            item_type_id: Number(form.item_type_id),
            stock_available: Number(form.stock_available),
            active: form.active === true || form.active === "true"
        });
    };

    return (
        <form className="form-card" onSubmit={handleSubmit}>
            <FormInput
                label="Item Name"
                name="name"
                value={form.name}
                onChange={handleChange}
            />

            <FormInput label="Item Type">
                <select
                    name="item_type_id"
                    value={form.item_type_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Item Type</option>
                    {types.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.type_name}
                        </option>
                    ))}
                </select>
            </FormInput>

            <FormInput
                label="Purchase Date"
                name="purchase_date"
                type="date"
                value={form.purchase_date}
                onChange={handleChange}
            />

            <FormInput
                label="Current Stock"
                name="stock_available"
                type="number"
                min="0"
                value={form.stock_available}
                onChange={handleChange}
            />

            <FormInput label="Status">
                <select
                    name="active"
                    value={String(form.active)}
                    onChange={handleChange}
                >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </FormInput>

            <button className="primary-btn" type="submit">
                {buttonText}
            </button>
        </form>
    );
}

export default ItemForm;
