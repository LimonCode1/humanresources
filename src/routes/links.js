const express = require('express');
const router = express.Router();
const poolDatabase = require('../database');
const helpers = require('../lib/helpers');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', isLoggedIn, (req, res) => {
	res.render('links/add');
});

router.post('/add', isLoggedIn, async (req, res) => {
	const { title, url, description, user_id } = req.body;
	const newLink = {
		title,
		url,
		description,
		user_id: req.user.id,
	};
	await poolDatabase.query('insert into links set ?', [newLink]);
	req.flash('success', 'link saved successfully');
	res.redirect('/links');
});

router.get('/:id', isLoggedIn, async (req, res) => {
	const { id } = req.params;
	// console.log('req> ' + id);
	const user = await poolDatabase.query('SELECT * FROM Usuario where id = ?', [id]);
	// console.log('data userrrr: ' + user[0]);
	res.render('links/editprofile', { userData: user[0] });
});

// actualizar datos de usuario
router.post('/:id', isLoggedIn, async (req, res) => {
	const { id } = req.params;
	const { cedula, name, lastName, username, clave, selectType } = req.body;
	const updateUser = {
		cedula: cedula,
		nombre: name,
		apellido: lastName,
		username: username,
		clave: clave,
		tipo_usuario: selectType,
	};
	// console.log('update dataa: ' + updateUser.clave);
	// siempre debe ir con await la encriptacion y las concultas debido a que estas toman tiempo
	updateUser.clave = await helpers.encryptPassword(updateUser.clave);
	// console.log('clave cifrada: ' + updateUser.clave);
	await poolDatabase.query('update Usuario set ? where id = ?', [updateUser, id]);
	req.flash('success', 'has actualizado con exito tus datos 😉 ' + updateUser.nombre);
	res.redirect('/perfil');
});

// Renderizar nomina handlebars
router.get('/nomina/:id', isLoggedIn, async (req, res) => {
	const { id } = req.params;
	const empleados = await poolDatabase.query(
		'select * from empleado as e inner join liquidacion as l on e.cedula = l.cedula_empleado;'
	);
	// console.log("id del usuario: " + id);
	res.render('links/nomina', { empleados });
});

// obtener datos nomina
// LIQUIDAR NOMINA
router.post('/nomina/:id', isLoggedIn, async (req, res) => {
	const { id } = req.params;
	const {
		periodoPago1,
		periodoPago2,
		fechaLiquidacion,
		empleado,
		basico,
		dias,
		extras,
		extrasNoc,
		extrasDf,
		nocturnas,
		dominical,
	} = req.body;

	const liquidacion = {
		cedula_empleado: empleado,
		fecha_inicial: periodoPago1,
		fecha_final: periodoPago2,
		fecha_liquidacion: fechaLiquidacion,
		salario_basico: basico,
		dias_liquidados: dias,
		horas_ex_diurnas: extras,
		horas_ex_nocturnas: extrasNoc,
		horas_ex_dom_fes: extrasDf,
		horas_nocturnas: nocturnas,
		horas_dom_fes: dominical,
		neto_pagado: 0,
		liquidador_id: id,
	};

	// console.log('datas : ' + liquidacion.liquidador_id);

	const dia = 29260;
	const salarioMinimo = 877805;
	const hora = 3658;
	const horaExtra = 4572;
	const horaExtraNocturna = 6401;
	const horaExtraDF = 7681;
	const horaNocturna = hora + 1280;
	const horaDF = horaExtraNocturna;

	var lExtras = liquidacion.horas_ex_diurnas * horaExtra;
	var lExtrasNocturna = liquidacion.horas_ex_nocturnas * horaExtraNocturna;
	var lExtrasDF = liquidacion.horas_ex_dom_fes * horaExtraDF;
	var lHorasNocturnas = liquidacion.horas_nocturnas * horaNocturna;
	var lHorasDF = liquidacion.horas_dom_fes * horaDF;
	var totalExtras = lExtras + lExtrasNocturna + lExtrasDF + lHorasNocturnas + lHorasDF;

	const salarioDevengado = (liquidacion.salario_basico / 30) * liquidacion.dias_liquidados;
	const auxilioTransporte = 102854;
	var totalDevengado = 0;
	if (liquidacion.salario_basico <= salarioMinimo * 2) {
		var totalDevengado = salarioDevengado + totalExtras + auxilioTransporte;
	} else {
		var totalDevengado = salarioDevengado + totalExtras;
	}

	const liquidacionFinal = {
		cedula_empleado: empleado,
		fecha_inicial: periodoPago1,
		fecha_final: periodoPago2,
		fecha_liquidacion: fechaLiquidacion,
		salario_basico: basico,
		dias_liquidados: dias,
		horas_ex_diurnas: lExtras,
		horas_ex_nocturnas: lExtrasNocturna,
		horas_ex_dom_fes: lExtrasDF,
		horas_nocturnas: lHorasNocturnas,
		horas_dom_fes: lHorasDF,
		neto_pagado: totalDevengado,
		liquidador_id: id,
	};
	// actualizacion tabla liquidacion con datos de form
	await poolDatabase.query('update liquidacion set ? where cedula_empleado = ?', [
		liquidacionFinal,
		liquidacion.cedula_empleado,
	]);

	req.flash('success', 'se ha liquidado con exito ✅');
	res.redirect('/perfil');
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {
	const { id } = req.params;
	await poolDatabase.query('DELETE FROM Usuario WHERE ID = ?', [id]);
	req.flash('success', 'se ha eliminado correctamente 🤖');
	res.redirect('/signin');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
	const { id } = req.params;
	const userData = await poolDatabase.query('SELECT * FROM Usuario WHERE ID = ?', [id]);
	// console.log(userData[0]);
	res.render('/links/edit', { user: userData[0] });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
	const { id } = req.params;
	const { title, description, url } = req.body;
	const newLink = {
		title,
		description,
		url,
	};
	// console.log(newLink);
	await poolDatabase.query('UPDATE links set ? WHERE id = ?;', [newLink, id]);
	req.flash('success', 'Links updated successfully.');
	res.redirect('/links');
});

module.exports = router;
