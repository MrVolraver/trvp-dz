const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Импортируем пакет cors

// Создаем приложение Express
const app = express();
const port = 5000; 

app.use(cors());
app.use(express.json()); 

const db = mysql.createConnection({
    host: 'localhost',       // Хост базы данных
    user: 'root',            // Имя пользователя базы данных
    password: 'root',    // Пароль пользователя базы данных
    database: 'TrolleybusNetwork' // Название базы данных
});

// Подключение к базе данных
db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return;
    }
    console.log('Подключение к базе данных успешно!');
});

// Маршрут для проверки работы сервера
app.get('/', (req, res) => {
    res.send('Сервер работает!');
});

// Получение всех маршрутов и их остановок
app.get('/routes', (req, res) => {
    const sql = `
        SELECT 
            r.route_id, 
            r.route_number, 
            s.stop_id, 
            s.stop_name,
            rs.stop_order
        FROM routes r
        LEFT JOIN route_stops rs ON r.route_id = rs.route_id
        LEFT JOIN stops s ON rs.stop_id = s.stop_id
        ORDER BY r.route_id, rs.stop_order
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err); // Вывод ошибки в консоль
            return res.status(500).json({ error: 'Ошибка при получении данных', details: err });
        }
        
        const routes = {};

        results.forEach(row => {
            const { route_id, route_number, stop_id, stop_name, stop_order } = row;
            
            // Если маршрут еще не добавлен в объект, создаем его с пустым массивом stops
            if (!routes[route_id]) {
                routes[route_id] = {
                    route_id,
                    route_number,
                    stops: []
                };
            }
            
            if (stop_id) {
                routes[route_id].stops.push({
                    stop_id,
                    stop_name,
                    stop_order
                });
            }
        });

        // Сортируем остановки внутри каждого маршрута по stop_order
        Object.values(routes).forEach(route => {
            route.stops.sort((a, b) => a.stop_order - b.stop_order);
        });

        const response = Object.values(routes);

        res.json(response); 
    });
});

app.post('/routes/add', (req, res) => {
    const { route_number, stops } = req.body;

    if (!route_number || stops.length < 2) {
        return res.status(400).json({ error: 'Недостаточно данных для создания маршрута' });
    }

    // Вставляем маршрут в таблицу маршрутов
    const insertRouteQuery = 'INSERT INTO routes (route_number) VALUES (?)';
    db.query(insertRouteQuery, [route_number], (err, routeResult) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при добавлении маршрута:'+ err.message });
        }

        const routeId = routeResult.insertId; // ID нового маршрута

        // Вставляем остановки для этого маршрута в таблицу route_stops
        const insertStopsQuery = 'INSERT INTO route_stops (route_id, stop_id, stop_order) VALUES ?';
        const stopInserts = stops.map((stopId, index) => [routeId, stopId, index+1]);

        // Вставляем массив значений для нескольких остановок
        db.query(insertStopsQuery, [stopInserts], (err, stopResult) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при добавлении остановок' });
            }

            res.status(201).json({ message: 'Маршрут успешно создан' });
        });
    });
});

app.put('/routes/update/:routeId', (req, res) => {
    const { routeId } = req.params;
    const { route_number, stops } = req.body;

    if (!route_number || stops.length < 2) {
        return res.status(400).json({ error: 'Недостаточно данных для обновления маршрута' });
    }

    const updateRouteQuery = 'UPDATE routes SET route_number = ? WHERE route_id = ?';
    db.query(updateRouteQuery, [route_number, routeId], (err, routeResult) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при обновлении маршрута: ' + err.message });
        }

        const deleteStopsQuery = 'DELETE FROM route_stops WHERE route_id = ?';
        db.query(deleteStopsQuery, [routeId], (err, deleteResult) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при удалении старых остановок: ' + err.message });
            }

            const insertStopsQuery = 'INSERT INTO route_stops (route_id, stop_id, stop_order) VALUES ?';
            const stopInserts = stops.map((stopId, index) => [routeId, stopId, index+1]);

            db.query(insertStopsQuery, [stopInserts], (err, insertResult) => {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при добавлении новых остановок: ' + err.message });
                }

                res.status(200).json({ message: 'Маршрут успешно обновлен' });
            });
        });
    });
});

app.delete('/routes/:id', (req, res) => {
    const routeId = req.params.id;

    const deleteRouteStops = 'DELETE FROM route_stops WHERE route_id = ?';
    const deleteRoute = 'DELETE FROM routes WHERE route_id = ?';

    // Удаление остановок маршрута
    db.query(deleteRouteStops, [routeId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при удалении остановок маршрута' });
        }

        db.query(deleteRoute, [routeId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при удалении маршрута' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Маршрут не найден' });
            }

            res.json({ message: 'Маршрут и его остановки успешно удалены' });
        });
    });
});

app.get('/stops', (req, res) => {
    const getAllStopsQuery = 'SELECT * FROM stops';

    db.query(getAllStopsQuery, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при получении списка остановок' });
        }

        res.status(200).json(result);
    });
});

app.get('/stops/neighbours', (req, res) => {
    const getNeighboursQuery = 'SELECT stop_id, neighbour_stop_id FROM stop_neighbours';

    db.query(getNeighboursQuery, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при получении зависимостей между остановками' });
        }

        res.status(200).json(result);
    });
});


// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});