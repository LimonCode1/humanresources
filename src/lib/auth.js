module.exports = {
	isNotLoggedIn(req, res, next) {
		if (!req.isAuthenticated) {
			return next();
		}
		return res.redirect('/perfil');
	},

	isLoggedIn(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			return res.redirect('/signin');
		}
	},
};
