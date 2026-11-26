
function FormInput({
    label,
    name,
    type = "text",
    value,
    onChange,
    required = true,
    children,
    min,
    placeholder
}) {
    return (
        <div className="form-group">
            <label>{label}</label>

            {children ? (
                children
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    min={min}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
}

export default FormInput;
