import { useEffect, useState } from "react";
import { GrAdd } from "react-icons/gr";
import { userService } from "../../services/users";
import { AuthUser } from "../../context/auth/types";
import AddUserModal from "../Modals/AddUserModal";
import "./styles.css";


export default function UsersTable() {
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [userQuery, setUserQuery] = useState<string>("");
    const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            await userService.getUsers({
                onHTTPSuccess: (data) => {
                    setUsers(data);
                },
                onHTTPError: (status, data) => {
                    console.log(status);
                    console.log(data);
                },
                onHTTPNetworkError: (e) => {
                    alert(e.message);
                },
            }, {
                query: userQuery,
            });
        })();
    }, [userQuery]);    
    
    async function handleSearchUsers(e: any) {
        const query = e.target.value;
        setUserQuery(query);
    }

    async function handleDeleteUser(userId: number) {
        await userService.deleteUser(userId, {
            onHTTPSuccess: (data) => {
                console.log(data);
                setUsers((prevUsers) => prevUsers.filter(({ id }) => id !== userId));
            },
            onHTTPError: (status, data) => {
                console.log(status);
                console.log(data);
            },
            onHTTPNetworkError: (e) => {
                alert(e.message);
            },
        });
    }

    return (
        <div className="data-table">
            { 
                showAddUserModal && (
                    <AddUserModal
                        onSuccess={(data) => {
                            setShowAddUserModal(false);
                            setUsers((prevUsers) => ([ ...prevUsers, data ]))
                        }} 
                        onButtonCancel={() => setShowAddUserModal(false)}  
                    /> 
                )
            } 
            <div className="table-search">
                <input
                    className="search-input"
                    placeholder="Search by email, phone number or name"
                    onChange={handleSearchUsers}
                />
            </div>
            <div className="table-wrapper">
                <table className="table-element" style={users?.length ? {} : { height: "100%" } }>
                    <thead className="table-header">
                        <tr className="header-row">
                            <th className="header-element"> ID </th>
                            <th className="header-element"> Avatar </th>
                            <th className="header-element"> Email </th>
                            <th className="header-element"> Phone Number </th>
                            <th className="header-element"> Confirmed </th>
                            <th className="header-element"> Active </th>
                            <th className="header-element"> Created At </th>
                            <th className="header-element"> Last Sign In </th>
                            <th className="header-element"> Display Name </th>
                            <th className="header-element"> Delete </th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                            {users?.length ? (
                                users.map((user, index) => (
                                    <tr key={index} className="body-row">
                                        <td className="body-cell"> {user.id} </td>
                                        <td className="body-cell">
                                            <img
                                                alt="avatar"
                                                src={user.avatar}
                                                height="40"
                                                width="40"
                                                style={{
                                                    borderRadius: "50%",
                                                }}
                                            />
                                        </td>
                                        <td className="body-cell">{user.email}</td>
                                        <td className="body-cell">
                                            {user.phone_number}
                                        </td>
                                        <td className="body-cell">
                                            {user.confirmed ? "T" : "F"}
                                        </td>
                                        <td className="body-cell">
                                            {user.active ? "T" : "F"}
                                        </td>
                                        <td className="body-cell">
                                            {new Date(
                                                user.created_at
                                            ).toLocaleString()}
                                        </td>
                                        <td className="body-cell">
                                            {user.last_sign_in
                                                ? new Date(
                                                    user.last_sign_in
                                                ).toLocaleString()
                                                : null}
                                        </td>
                                        <td className="body-cell">
                                            {user.display_name}
                                        </td>
                                        <td className="body-cell">
                                            <button
                                                onClick={() =>
                                                    handleDeleteUser(user.id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="row-empty-state" colSpan={100}>
                                        <div>
                                            <img
                                                alt="empty-state"
                                                src="/assets/no-results.svg"
                                                height={150}
                                            />
                                            <p> No user data </p>
                                            <button className="btn btn-primary" onClick={() => setShowAddUserModal(true)}>
                                                Add user
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                    </tbody>
                    { users.length && <GrAdd className="add-user-icon" onClick={() => setShowAddUserModal(true) } /> }
                </table>
            </div>
        </div>
    );
}
