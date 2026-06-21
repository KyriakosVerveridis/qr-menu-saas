export default function Sidebar() {
    return (
        <div className="sidebar">
            <h2>Sidebar</h2>
            <ul>
                <li><a href="/dashboard/stores">Καταστήματα</a></li>
                <li><a href="/dashboard/menu-editor">Επεξεργαστής Μενού</a></li>
            </ul>
        </div>
    );
}