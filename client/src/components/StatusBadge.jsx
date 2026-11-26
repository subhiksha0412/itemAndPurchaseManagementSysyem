
function StatusBadge({ status }) {
    const value = String(status ?? "").toLowerCase();

    let className = "status-badge";

    if (["active", "in stock"].includes(value) || value === "true") {
        className += " active";
    } else if (["inactive", "out of stock"].includes(value) || value === "false") {
        className += " inactive";
    } else {
        className += " warning";
    }

    return (
        <span className={className}>
            {status === true ? "Active" : status === false ? "Inactive" : status}
        </span>
    );
}

export default StatusBadge;
