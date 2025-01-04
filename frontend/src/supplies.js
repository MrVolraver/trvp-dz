import { getStopNeighbours } from "./requests";

export const validateRouteStops = async (stops) => {
    try {
        const stopNeighbours = await getStopNeighbours();

        for (let i = 0; i < stops.length - 1; i++) {
            const currentStop = stops[i];
            const nextStop = stops[i + 1];

            // Проверяем, есть ли связь между текущей остановкой и следующей
            const hasConnection = stopNeighbours.some(
                (neighbour) =>
                    (neighbour.stop_id === currentStop && neighbour.neighbour_stop_id === nextStop) ||
                    (neighbour.stop_id === nextStop && neighbour.neighbour_stop_id === currentStop)
            );

            if (!hasConnection) {
                return [currentStop, nextStop];
            }
        }

        return 'Маршрут валиден';
    } catch (error) {
        console.error('Ошибка:', error);
        return `Ошибка при валидации маршрута: ${error.message}`;
    }
};