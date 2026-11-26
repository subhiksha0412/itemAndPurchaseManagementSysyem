
function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <div className="dialog-overlay">
            <div className="dialog">
                <p>{message}</p>

                <button className="danger-btn" onClick={onConfirm}>
                    Confirm
                </button>

                <button className="secondary-btn" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default ConfirmDialog;
