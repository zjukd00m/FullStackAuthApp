import { useEffect, useState } from "react";
import { userService } from "../../services/users";
import { AuthUser } from "../../context/auth/types";
import AddUserForm from "../Forms/User/AddUserForm";
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
                setShowAddUserModal(false);
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
            <div className="table-search">
                <input
                    className="search-input"
                    placeholder="Search by email, phone number or name"
                    onChange={handleSearchUsers}
                />
                <div className="dropdown">
                    <button className="btn btn-secondary btn-xs text-white dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        Options
                    </button>
                    <ul className="dropdown-menu">
                        <li> <button className="dropdown-item btn-sm" onClick={() => setShowAddUserModal(true)}> Add user </button></li>
                    </ul>
                </div>
            </div>
            <div className="table-wrapper">
                <table className="table-element" style={{ height: "100%" } }>
                    <thead className="table-header">
                        <tr className="header-row">
                            <th className="header-element"> ID </th>
                            <th className="header-element"> Avatar </th>
                            <th className="header-element"> Email </th>
                            <th className="header-element"> Name </th>
                            <th className="header-element"> Phone </th>
                            <th className="header-element"> Confirmed </th>
                            <th className="header-element"> Active </th>
                            <th className="header-element"> Created At </th>
                            <th className="header-element"> Last Sign In </th>
                            <th className="header-element"> Edit </th>
                            <th className="header-element"> Delete </th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                            <tr>
                            {
                                showAddUserModal ? (
                                    <div className="position-absolute w-100">
                                        <AddUserForm 
                                            onSuccess={(data) => {
                                                setShowAddUserModal(false);
                                                setUsers((prevUsers) => ([...prevUsers, data]));
                                            }} 
                                            onCancel={() => setShowAddUserModal(false)}
                                        />
                                    </div>
                                ) : null
                            }
                            </tr>
                            {users?.length ? (
                                users.map((user, index) => (
                                    <tr key={index} className="body-row" style={{ backgroundColor: "red !important" }}>
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
                                            {
                                                user.display_name?.length
                                                ? user.display_name 
                                                : <i className="fa-solid fa-circle-exclamation fa-lg icon-warning"></i>
                                            }
                                        </td>
                                        <td className="body-cell">
                                            {
                                                user.phone_number?.length
                                                ? user.phone_number
                                                : <i className="fa-solid fa-circle-exclamation fa-lg icon-warning"></i>
                                            }
                                        </td>
                                        <td className="body-cell">
                                            {
                                                user.confirmed 
                                                ? <i className="fa-solid fa-check fa-xl icon-success"></i> 
                                                : <i className="fa-solid fa-circle-xmark fa-xl icon-danger"></i>
                                            }
                                        </td>
                                        <td className="body-cell">
                                            {
                                                user.active 
                                                ? <i className="fa-solid fa-check fa-xl icon-success"></i> 
                                                : <i className="fa-solid fa-circle-xmark fa-xl icon-danger"></i>
                                            }
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
                                            <button
                                                className="btn text-bg-primary text-white"
                                                style={{ fontSize: "12px" }}
                                                onClick={() => {
                                                    window.location.href = `/profile/${user.id}`;
                                                }}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                        <td className="body-cell">
                                            <button
                                                className="btn btn-danger text-white"
                                                style={{ fontSize: "12px" }}
                                                onClick={() => {
                                                    if(window.confirm("Are you sure?")) {
                                                        handleDeleteUser(user.id)
                                                    }
                                                }}
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
                                            <button className="btn btn-primary text-white" onClick={() => setShowAddUserModal(true)}>
                                                Add user
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
