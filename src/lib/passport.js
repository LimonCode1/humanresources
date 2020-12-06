const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const poolDatabase = require('../database');
const helpers = require('../lib/helpers');
passport.use(
	'local.signin',
	new LocalStrategy(
		{
			usernameField: 'username',
			passwordField: 'clave',
			passReqToCallback: true,
		},
		async (req, username, clave, done) => {
			// console.log(req.body);
			const rows = await poolDatabase.query('select * from Usuario where username = ?', [username]);
			// console.log(rows[0]);
			if (rows.length > 0) {
				const user = rows[0];
				const validPassword = await helpers.loginPassword(clave, user.clave);
				// console.log('claveee: ' + validPassword);
				if (validPassword) {
					done(null, user, req.flash('success', 'Bienvenido de nuevo ' + user.username + ' 👋'));
				} else {
					done(
						null,
						false,
						req.flash('message', 'Clave incorrecta, vamos intenta escribirla de nuevo! 🤔')
					);
				}
			} else {
				return done(null, false, req.flash('message', 'Upps!, este usuario no existe 😯'));
			}
		}
	)
);

passport.use(
	'local.signup',
	new LocalStrategy(
		{
			usernameField: 'username',
			passwordField: 'clave',
			passReqToCallback: true,
		},
		async (req, username, clave, done) => {
			// console.log(req.body);
			const cedula = req.body.cedula;
			const nombre = req.body.name;
			const apellido = req.body.lastName;
			const tipo_usuario = req.body.selectType;
			const newUser = {
				cedula,
				nombre,
				apellido,
				username,
				clave,
				tipo_usuario,
			};
			newUser.clave = await helpers.encryptPassword(clave);
			const result = await poolDatabase.query('insert into Usuario set ?', [newUser]);
			// console.log(result);
			newUser.id = result.insertId;
			return done(null, newUser);
		}
	)
);

// ===========================================================================================================
// SOLUCION PARA CUANDO NO DESERIALIZA: ELIMINAR CACHE DE NODE Y EJECUTAR DE NUEVO NPM RUN,
// DEL NAVEGADOR ELIMINAR HISTORIAL Y CERRAR TABS DE LA APP,
// ELIMINAR LA EJECUCUION EN LA CONSOLA DEL NPM RUN, DE NUEVO ELIMINAR LA CACHE Y EJECUTAR EL NPM RUN DE NUEVO
// ============================================================================================================
passport.serializeUser((user, done) => {
	// console.log('serializado: ' + user.id);
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	const rows = await poolDatabase.query('select * from Usuario where id = ?', [id]);
	// console.log('deserializado: ' + rows[0]);
	done(null, rows[0]);
});
