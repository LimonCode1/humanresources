const bcrypt = require('bcryptjs');
const helpers = {};
helpers.encryptPassword = async (password) => {
	const saltHash = await bcrypt.genSalt(10);
	const finalHash = await bcrypt.hash(password, saltHash);
	return finalHash;
};

helpers.loginPassword = async (password, savedPassword) => {
	try {
		return await bcrypt.compare(password, savedPassword);
	} catch (e) {
		console.log(e);
	}
};

module.exports = helpers;
