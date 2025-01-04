import { useState } from "react"
import AddRoute from "./AddRoute";
import { updateRoute } from "../../requests";

export default function Card({id, title, stops, handleDeleteRoute}) {
    const[shown, setShown] = useState(false);
    const[edit, setEdit] = useState(false);

    const data = stops.map((element) => {
        return { stop_id: element.stop_id, stop_name: element.stop_name }
    })

    return (
        <div id={id} className={`card-block ${shown ? 'shown' : ''} `}>
            {edit?(
                <AddRoute setShown={setEdit} initialTitle={title} initialData={data} id={id} requestFunction={updateRoute}/>
            ):(
                <>
                    <div className="card-block-title">
                        <div>
                            <h2 className="card-block-title-name">
                                Маршрут №{title}
                            </h2>
                            <img src="/images/icon-remove.png" onClick={() => handleDeleteRoute(id, title)} className="card-block-title-delete-button" alt="Удалить" />
                            <img src="/images/icon-edit.png" onClick={() => setEdit(true)} className="card-block-title-edit-button" alt="Изменить" />
                        
                        </div>
                        <button className="card-block-title-button" onClick={() => setShown(!shown)}>{shown?"Скрыть":"Подробнее"}</button>
                    </div>
                    {shown?(
                        <div className="card-block-stops-list">
                        {stops.map((element, index) => {
                            return (
                                <div key={index} className="card-block-stops-list-item">
                                    {index === 0?(
                                        <p>Начало</p>
                                    ):""}
                                    {index === stops.length - 1?(
                                        <p>Конец</p>
                                    ):""}
                                    <span id={element.stop_id} className="card-block-stops-list-item-inner">
                                        {element.stop_name}
                                    </span>
                                </div>
                            )
                        })}

                    </div>
                    ):""}
                </>
            )}
        </div>
    )
}