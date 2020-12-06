const mysql = require('mysql');

const { database } = require('./keys');
// modulo para convertir CALLBACKS in PROMISES
const { promisify } = require('util');

// vamos a utilizar una funcion del paquete de mysql llamada createPool()
// esta funcion nos permite ejecutar operaciones a la DB en varios hilos en secuencia,
// es muy util para entornos de produccion

const pool = mysql.createPool(database);

// aca por medio del metodo de obtener la conexion vamos a obtener un callback
// el cual nos dara por respuesta un error o un exito en la conexion a la DB
pool.getConnection((err, connection) => {
	if (err) {
		// Bien , si la conexion nos retorna un error, validaremos cual de estos errores
		// que son los mas comunes, fue el que ocurrio y daremos una respuesta predeterminada
		// a cada uno de los mismos

		// POR SI SE CIERRA LA CONEXION
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			console.log('DATABASE CONNECTION WAS CLOSED!');
		}

		// POR SI YA HAY UNA CONEXION CREADA
		if (err.code === 'ER_CON_COUNT_ERROR') {
			console.log('DATABASE HAS TO MANY CONNECTIONS!');
		}

		// POR SI SE RECHAZA LA CONEXION
		if (err.code === 'ECONNREFUSED') {
			console.log('DATABASE CONNECTION WAS REFUSED!');
		}
	}

	// ahora si la conexion ha sido exitosa
	if (connection) connection.release();
	console.log('DB is full connected');
	return;
});

// --- EL MODULO DE MYSQL NO SOPORTA PROMESAS, POR LO TANTO TAMPOCO ASYNC/AWAIT
// --- POR LO QUE DEBEMOS UTILIZAR CALLBACKS
// --- HAY UN MODULO EL CUAL NOS CONVIERTE CALLBACKS EN PROMISES Y ES promisify,
// este modulo lo importamos al inicio y ahora lo usaremos

// debido a esta linea de codigo, podemos hacer consultas a la base de datos con
// promises debido a que promisify las convierte en callbacks y viceversa
pool.query = promisify(pool.query);

// para poder utilizar este modulo, lo debemos de exportar
module.exports = pool;
