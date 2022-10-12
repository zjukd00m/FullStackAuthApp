import { useRouteError } from "react-router-dom";

export default function NotFound() {
    const error = useRouteError();

    console.error(error);

    return (
        <div>
            <p> 404 </p>
        </div>
    )
}