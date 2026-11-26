
import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">
            <h2 className="brand">Item Manager</h2>

            <nav>
                <NavLink to="/">Dashboard</NavLink>
                <NavLink to="/item-types">Item Types</NavLink>
                <NavLink to="/items">Items</NavLink>
                <NavLink to="/purchases">Purchases</NavLink>
                <NavLink to="/stock">Stock</NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;
