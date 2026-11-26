
function PageHeader({ title, buttonText, onClick }) {
    return (
        <div className="page-header">
            <h2>{title}</h2>

            {buttonText && (
                <button className="primary-btn" onClick={onClick}>
                    {buttonText}
                </button>
            )}
        </div>
    );
}

export default PageHeader;
