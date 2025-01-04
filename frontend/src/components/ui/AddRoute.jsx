import React, { useState, useEffect } from 'react';
import { getStops } from '../../requests';

export default function AddRoute({ id = '', setShown, initialTitle = '', initialData = [{ stop_id: '', stop_name: '' }, { stop_id: '', stop_name: '' }], requestFunction }) {
    const [routeNumber, setRouteNumber] = useState(initialTitle);
    const [allStops, setAllStops] = useState([]); // Все доступные остановки
    const [selectedStops, setSelectedStops] = useState(initialData);

    // Загрузка всех доступных остановок с сервера при монтировании
    useEffect(() => {
        getStops(setAllStops);
    }, []);

    // Добавление нового поля для выбора остановки
    const addNewStopField = () => {
        const updatedStops = [...selectedStops, { stop_id: '', stop_name: '' }];
    
        // Проверка: если предпоследняя остановка совпадает с первой, сбросим ее
        if (updatedStops.length > 2) {
            const firstStopId = updatedStops[0]?.stop_id;
            const secondToLastStopId = updatedStops[updatedStops.length - 2]?.stop_id;
    
            if (firstStopId && secondToLastStopId && firstStopId === secondToLastStopId) {
                updatedStops[updatedStops.length - 2] = { stop_id: '', stop_name: '' };
            }
        }
    
        setSelectedStops(updatedStops); 
    };

    // Удаление остановки
    const removeStop = (index) => {
        const updatedStops = selectedStops.filter((_, i) => i !== index);
        setSelectedStops(updatedStops);
    };

    // Изменение остановки
    const handleStopChange = (index, stopId) => {
        const updatedStops = [...selectedStops];
        const stop = allStops.find((s) => parseInt(s.stop_id) === parseInt(stopId));
    
        const isFirstStop = index === 0;
        const isLastStop = index === selectedStops.length - 1;
    
        // Проверка на кольцевой маршрут: первая и последняя остановка могут совпадать
        const isValidCircularRoute = (isFirstStop && parseInt(selectedStops[selectedStops.length - 1]?.stop_id) === parseInt(stopId)) ||
            (isLastStop && parseInt(selectedStops[0]?.stop_id) === parseInt(stopId));
    
        // Проверка на уникальность для промежуточных остановок
        if (selectedStops.some((s, i) => parseInt(s.stop_id) === parseInt(stopId) && i !== index)) {
            // Если добавляем не последнюю или не первую остановку, сбрасываем значение
            if (!isValidCircularRoute) {
                updatedStops[index] = { stop_id: '', stop_name: '' }; // Сбрасываем значение
                setSelectedStops(updatedStops);
                return;
            }
        }
        updatedStops[index] = stop;
        setSelectedStops(updatedStops);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const routeData = {
            route_number: parseInt(routeNumber),
            stops: selectedStops.map((s) => parseInt(s.stop_id)),
        };

        const res = await requestFunction(routeData, id);
        if (res === 200) {
            setShown(false);
            window.location.reload();
        }else if(Array.isArray(res)){
            const stopFrom = allStops.find(stop => stop.stop_id === res[0]);
            const stopTo = allStops.find(stop => stop.stop_id === res[1]);
            if (stopFrom && stopTo) {
                alert(`Невозможно добраться от "${stopFrom.stop_name}" до "${stopTo.stop_name}"`);
            }
        }
    };

    return (
        <div className="addroute-block">
            <h2>{initialTitle?"Изменение маршрута":"Создание маршрута"}</h2>

            <form onSubmit={handleSubmit} className="addroute-block-form">
                <div className="addroute-block-form-route-number">
                    <label htmlFor="routeNumber">Номер маршрута:</label>
                    <input
                        type="text"
                        id="routeNumber"
                        value={routeNumber}
                        onChange={(e) => setRouteNumber(e.target.value)}
                        required
                    />
                </div>

                <div className="addroute-block-form-stops">
                    <h3>Остановки:</h3>
                    {selectedStops.map((stop, index) => (
                        <div key={index} className="addroute-block-form-stops-item">
                            <select
                                value={stop?.stop_id || ''}
                                onChange={(e) => handleStopChange(index, e.target.value)}
                                required
                            >
                                <option value="" disabled>
                                    Выберите остановку
                                </option>
                                {allStops.map((stopOption) => (
                                    <option key={stopOption.stop_id} value={stopOption.stop_id}>
                                        {stopOption.stop_name}
                                    </option>
                                ))}
                            </select>
                            {index > 1 && (
                                <button type="button" onClick={() => removeStop(index)}>
                                    Удалить
                                </button>
                            )}
                        </div>
                    ))}

                    <button type="button" className='unfiled-button' onClick={addNewStopField}>
                        Добавить остановку
                    </button>
                </div>

                <div className="addroute-block-form-buttons">
                    <button className="grey-button" type="chancel" onClick={() => setShown(false)}>Отменить</button>
                    <button className="filed-button" type="submit">{initialTitle?"Сохранить":"Создать"}</button>
                </div>
            </form>
        </div>
    );
}