import { validateRouteStops } from "./supplies";

// ---------- Адрес сервера ----------

const URL = "http://localhost:5000";

// ---------- Запрос на получение всех маршрутов и их остановок ----------

export const fetchRoutes = async (setData) => {
    try {
      const response = await fetch(`${URL}/routes`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
      if (!response.ok) {
        throw new Error('Ошибка при получении данных');
      }

      const data = await response.json();
      
      setData(data);
    } catch (error) {
      console.error('Ошибка при загрузке маршрутов:', error.message);
      alert('Ошибка при загрузке маршрутов: ' + error.message);
    }
  };

// ---------- Запрос на удаление маршрута по его ID ----------

export const deleteRoute = async (routeId) => {
    try {
        const response = await fetch(`${URL}/routes/${routeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при удалении маршрута');
        }

        const result = await response.json();
        return result; 
    } catch (error) {
        console.error('Ошибка:', error.message);
        alert('Ошибка при удалении маршрута: ' + error.message);
    }
};

// ---------- Запрос на добавление маршрута ----------

export const addRoute = async (routeData) => {
  try {
    const validationMessage = await validateRouteStops(routeData.stops);

    if(Array.isArray(validationMessage)){
      return validationMessage;
    }

    const response = await fetch(`${URL}/routes/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(routeData),
    });

    if (!response.ok) {
      throw new Error('Ошибка при добавлении маршрута');
    }

    alert('Маршрут успешно добавлен!');
    return 200;

  } catch (error) {
    console.error('Ошибка:', error.message);
    alert('Ошибка при добавлении маршрута: ' + error.message);
  }
};

// ---------- Запрос на получение всех остановок ----------

export const getStops = async (setAllStops) => {
  try {
      const response = await fetch(`${URL}/stops`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      });

      if (!response.ok) {
          throw new Error('Ошибка при получении остановок');
      }

      const data = await response.json();
      console.log(data);
      setAllStops(data)
  } catch (error) {
      console.error('Ошибка при загрузке остановок:', error.message);
      alert('Ошибка при загрузке остановок: ' + error.message);
  }
};

// ---------- Запрос на обновление маршрута ----------

export const updateRoute = async (routeData, routeId) => {
  try {
    const validationMessage = await validateRouteStops(routeData.stops);

    if (Array.isArray(validationMessage)) {
      console.log(validationMessage);
      return validationMessage;
    }

    const response = await fetch(`${URL}/routes/update/${routeId}`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(routeData),
    });

    if (!response.ok) {
      throw new Error('Ошибка при обновлении маршрута');
    }

    alert('Маршрут успешно обновлен!');
    return 200;

  } catch (error) {
    console.error('Ошибка:', error.message);
    alert('Ошибка при обновлении маршрута: ' + error.message);
  }
};

// ---------- Запрос на получение связей между остановками ----------

export const getStopNeighbours = async () => {
  try {
      const response = await fetch(`${URL}/stops/neighbours`);
      if (!response.ok) {
          throw new Error('Ошибка при получении данных соседних остановок');
      }
      return await response.json();
  } catch (error) {
      console.error('Ошибка при запросе зависимостей:', error);
      alert('Ошибка при получении зависимостей остановок: ' + error.message);
      throw new Error('Не удалось получить данные соседних остановок');
  }
};