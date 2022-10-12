import Navbar from "../../components/Navbar";
import UsersTable from "../../components/UsersTable";

export default function Home() {
    return (
        <div>
            <div
                style={{
                    marginLeft: "60px",
                    marginRight: "60px",
                    marginTop: "30px",
                    height: "80vh",
                }}
            >
                <UsersTable />
            </div>
        </div>
    );
}
