const express = require('express');
const router = express.Router();
const pool = require('../database');
const helpers = require('../lib/helpers');
const { isLoggedIn } = require('../lib/auth');

// ruta del perfil
router.get('/perfil', isLoggedIn, (req, res) => {
	res.render('perfil');
});

// ruta del empleado y listado de los mismos
router.get('/empleados', isLoggedIn, async (req, res) => {
	const listaEmpleados = await pool.query('SELECT * FROM empleado');
	// console.log('listado: '+ listaEmpleados);
	res.render('empleados', { listaEmpleados });
});

// registrando empleado
router.post('/empleados', isLoggedIn, async (req, res) => {
	const { cedula, name, lastName1, lastName2, direccion, telefono, cargo, id_creador } = req.body;
	const nuevoEmpleado = {
		cedula: cedula,
		nombre: name,
		apellido_1: lastName1,
		apellido_2: lastName2,
		direccion: direccion,
		telefono: telefono,
		cargo: cargo,
		id_creador: req.user.id,
		estado: 'Activo',
	};

	const templateLiquidacion = {
		cedula_empleado: cedula,
		fecha_inicial: '2020/01/01',
		fecha_final: '2020/01/01',
		fecha_liquidacion: '2020/01/01',
		salario_basico: 0,
		dias_liquidados: 0,
		horas_ex_diurnas: 0,
		horas_ex_nocturnas: 0,
		horas_ex_dom_fes: 0,
		horas_nocturnas: 0,
		horas_dom_fes: 0,
		neto_pagado: 0,
		liquidador_id: req.user.id,
	};
	// console.log('employee:  ' + nuevoEmpleado);
	await pool.query('insert into empleado set ?', [nuevoEmpleado]);
	// insercion de datos en liquidacion
	await pool.query('insert into liquidacion set ?', [templateLiquidacion]);

	req.flash('success', 'se ha sido vinculado a ' + nuevoEmpleado.nombre + ' ☑️ ');
	res.redirect('empleados');
});

module.exports = router;
