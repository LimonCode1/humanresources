const express = require('express');
const morgan = require('morgan');
const expressHbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const { database } = require('./keys');
const passport = require('passport');

const app = express();
require('./lib/passport');

//settings
app.set('port', process.env.PORT || 4000);

app.set('views', path.join(__dirname, 'views'));

app.engine(
	'.hbs',
	expressHbs({
		defaultLayout: 'main',
		layoutsDir: path.join(app.get('views'), 'layouts'),
		partialsDir: path.join(app.get('views'), 'partials'),
		extname: '.hbs',
		helpers: require('./lib/handlebars'),
	})
);
app.set('view engine', '.hbs');

// MIDDLEWARES - Son funciones que se ejecutan cada vez que un cliente envia una peticion al servidor
app.use(
	session({
		secret: 'ghAppSession',
		resave: false,
		saveUninitialized: false,
		store: new MySQLStore(database),
	})
);
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// GLobal Variables

// esta funcion es un middleware en el cual estableceremos las variables, que queremos que sean globales
// y accesibles desde cualquier parte de nuestra app
app.use((req, res, next) => {
	app.locals.success = req.flash('success');
	app.locals.message = req.flash('message');
	app.locals.user = req.user;
	next();
});

// Routes
app.use(require('./routes/index.js'));
app.use(require('./routes/authentication'));
app.use(require('./routes/navbar'));
app.use('/links', require('./routes/links'));

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting the server
app.listen(app.get('port'), () => {
	console.log('server up in http://localhost:' + app.get('port'));
});
