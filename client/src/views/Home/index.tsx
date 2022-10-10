import { useEffect } from "react";
import Navbar from "../../components/Navbar";
import UsersTable from "../../components/UsersTable";
import useAuth from "../../context/auth/AuthHook";

export default function Home() {
    const { user, getProfile } = useAuth();

    useEffect(() => {
        ;(async () => {
            await getProfile({
                onHTTPSuccess: (data) => {
                    console.log("The user profile in home");
                    console.log(data);
                },
                onHTTPError: (status, data) => {
                    console.log(data);
                    alert(status);
                },
                onHTTPNetworkError: (e) => {
                    alert(e.message);
                }
            });
        })()
    }, []);

    console.log("Home user")
    console.log(user);

    return (
        <div>
            <Navbar user={user} />
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
