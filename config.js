const dotenv = require('dotenv');
dotenv.config();
const log = console.log;

module.exports = {
	corrUsername: process.env.CORRLINKS_USERNAME,
	corrPassword: process.env.CORRLINKS_PASSWORD,
	accounts: [
		{
			email: "joerogan1220@gmail.com",
			password: "AbtMC1220",
		},
		{
			"email": "williambaldwin1220@gmail.com",
			"password": "AbtMC1220",
		},
		{
			"email": "alphabravo121220@gmail.com",
			"password": "AbtMC1220",
		},
	],
	nbrowsers: 3,
	keywords: ["pollockmed", "colemanusp", "mccrearyusp"]
};