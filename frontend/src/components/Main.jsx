import { useEffect, useState } from "react"
import { fetchRoutes, deleteRoute, addRoute } from "../requests";

import Card from "./ui/Card";
import AddRoute from "./ui/AddRoute";

export default function Main() {
    const [routes, setRoutes] = useState([]);
    const [shown, setShown] = useState(false);

    const handleDeleteRoute = async (routeId, title) => {
        if (window.confirm(`Вы уверены, что хотите удалить маршрут №${title}?`)) {
            const res = await deleteRoute(routeId);
            if(res){
                setRoutes(routes.filter((route) => route.route_id !== routeId));
            }
            alert(res.message);
        }
    };

    useEffect(() => {
        fetchRoutes(setRoutes);
    }, [])

    return (
        <main className="main-block">
            {shown?(
                <div className="main-block-addroute">
                    <img className="main-block-addroute-sheme-image" src="/images/Routes_sheme.jpg" alt="Схема остановок" />
                    <AddRoute setShown={setShown} requestFunction={addRoute} />
                </div>
            ):(
                <div className="main-block-menu">
                    <button className="filed-button" onClick={() => setShown(true)}>Добавить маршрут</button>
                </div>
            )}
            <div className="main-block-cards-list">
                {routes.map((element, index) => {
                    return (
                        <Card key={index} id={element.route_id} title={element.route_number} stops={element.stops} handleDeleteRoute={handleDeleteRoute}/>
                    )
                })}
            </div>
        </main>
    )
}