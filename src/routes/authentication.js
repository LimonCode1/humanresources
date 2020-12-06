const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');
const { isNotLoggedIn } = require('../lib/auth');

router.get('/signup', (req, res) => {
	res.render('auth/signup');
});

router.post(
	'/signup',
	passport.authenticate('local.signup', {
		successRedirect: '/perfil',
		failureRedirect: '/signup',
		failureFlash: true,
	})
);

router.get('/signin', (req, res) => {
	res.render('auth/signin');
});

router.post('/signin', (req, res, next) => {
	passport.authenticate('local.signin', {
		successRedirect: '/perfil',
		failureRedirect: '/signin',
		failureFlash: true,
	})(req, res, next);
});

router.get('/perfil', isLoggedIn, (req, res) => {
	res.render('perfil');
});

router.post('/perfil', (req, res, next) => {
	passport.authenticate('local.edit', {
		successRedirect: '/perfil',
		failureRedirect: '/perfil',
		failureFlash: true,
	})(req, res, next);
});
router.post('/edit/:id', isLoggedIn, async (req, res) => {
	const { id } = req.params;
	const { title, description, url } = req.body;
	const newLink = {
		title,
		description,
		url,
	};
	console.log(newLink);
	await poolDatabase.query('UPDATE links set ? WHERE id = ?;', [newLink, id]);
	req.flash('success', 'Links updated successfully.');
	res.redirect('/links');
});

router.get('/logout', isLoggedIn, (req, res) => {
	req.logOut();
	res.redirect('/signin');
});

module.exports = router;
