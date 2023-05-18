


export function validarNombre(nombre) {

	let retArray = [];
	const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*)*$/;

	if (nombre == '') {
		retArray = ["nombre", 'custom-is-invalid',
			"El nombre no puede estar vacío", "text-danger", "text-danger fa-solid fa-circle-xmark", false];

	}
	else {

		if (regex.test(nombre)) {
			retArray = ["nombre", 'custom-is-valid',
				"El nombre es correcto", "text-success", "text-success fa-solid fa-check", true];

		}
		else {
			retArray = ["nombre", 'custom-is-invalid',
				"El nombre no puede contener números ni caracteres no alfanuméricos", "text-danger", "text-danger fa-solid fa-circle-xmark", false]
		}
	}
	return retArray;
}

export function validarApellidos(apellidos) {

	let retArray = [];
	const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*)*$/;

	if (apellidos == '') {

		retArray = ["apellidos", 'custom-is-invalid',
			"Los apellidos no puede estar vacíos", "text-danger", "text-danger fa-solid fa-circle-xmark", false];

	}
	else {

		if (regex.test(apellidos)) {
			retArray = ["apellidos", 'custom-is-valid',
				"Los apellidos son correctos", "text-success", "text-success fa-solid fa-check", true];
		}
		else {
			retArray = ["apellidos", 'custom-is-invalid',
				"Los apellidos no puede contener números ni caracteres no alfanuméricos", "text-danger", "text-danger fa-solid fa-circle-xmark", false];
		}
	}

	return retArray;
}

export function validarCorreo(correo, correoExiste) {

	let retArray = [];
	const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

	if (correo == '') {

		retArray = ["correo", 'custom-is-invalid',
			"El correo no puede estar vacío", "text-danger", "text-danger fa-solid fa-circle-xmark", false];
	}
	else {

		if (regex.test(correo)) {

			if (correoExiste) {

				retArray = ["correo", 'custom-is-invalid',
					"El correo ya está registrado", "text-danger", "text-danger fa-solid fa-circle-xmark", false];
			}
			else {
				retArray = ["correo", 'custom-is-valid',
					"El correo es válido", "text-success", "text-success fa-solid fa-check", true];
			}

		}
		else {

			retArray = ["correo", 'custom-is-invalid',
				"El correo tiene que tener un formato válido, ejemplo: prueba@gmail.com", "text-danger", "text-danger fa-solid fa-circle-xmark", false];

		}
	}

	return retArray;

}


export function validarDni(dni, dniExiste) {

	let retArray = [];
	const regex = /^[XYZ]\d{7}[TRWAGMYFPDXBNJZSQVHLCKE]$|^\d{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;

	if (dni == '') {
		retArray = ["dni", 'custom-is-invalid',
			"El NIF/NIE no puede estar vacío", "text-danger", "text-danger fa-solid fa-circle-xmark", false];
	}
	else {

		if (regex.test(dni)) {

			if (validarDigitoDeControlDni(dni)) {

				if (dniExiste) {
					retArray = ["dni", 'custom-is-invalid',
						"El NIF/NIE ya está en uso", "text-danger", "text-danger fa-solid fa-circle-xmark", false];
				}
				else {
					retArray = ["dni", 'custom-is-valid',
						"El NIF/NIE es válido", "text-success", "text-success fa-solid fa-check", true];
				}


			}
			else {
				retArray = ["dni", 'custom-is-invalid',
					"El dígito de control del NIF/NIE no es válido", "text-danger", "text-danger fa-solid fa-circle-xmark", false];
			}

		}
		else {
			retArray = ["dni", 'custom-is-invalid',
				"El NIF/NIE tiene que tener un formato válido, ejemplo: 12345678Z o X1234567L", "text-danger", "text-danger fa-solid fa-circle-xmark", false];
		}
	}

	return retArray;
}


function validarDigitoDeControlDni(dni) {

	const letras = "TRWAGMYFPDXBNJZSQVHLCKE";

	const letra = dni.charAt(8).toUpperCase();

	if (/^[XYZ]/.test(dni)) {
		// convertir primera letra a número
		const firstChar = {
			X: 0,
			Y: 1,
			Z: 2,
		}[dni.charAt(0)];
		const number = parseInt(firstChar + dni.substr(1, 7));
		const index = number % 23;
		return letra === letras.charAt(index);
	}

	// comprobar si es NIF
	const number = parseInt(dni.substr(0, 8));
	const index = number % 23;
	return letra === letras.charAt(index);
}

export function validarPassword(password) {

	let retArray = [];
	const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;


	if (password == '') {
		retArray = ["password", 'custom-is-invalid',
			"La contraseña no puede estar vacía", "text-danger", "text-danger fa-solid fa-circle-xmark", false];
	}
	else {

		if (regex.test(password)) {
			retArray = ["password", 'custom-is-valid',
				"Las contraseña es correcta", "text-success", "text-success fa-solid fa-check", true];
		}
		else {
			retArray = ["password", 'custom-is-invalid',
				"La contraseña debe tener un mínimo de 8 caracteres de longitud y también una letra minúscula y otra mayúscula, un caracter no alfanumérico y un número", "text-danger", "text-danger fa-solid fa-circle-xmark", false];
		}
	}

	return retArray;
}

export function validarRepeatPassword(password, repeatedPassword) {

	let retArray = [];

	if (repeatedPassword == '') {
		retArray = ["repeatPassword", 'custom-is-invalid',
			"Por favor, repita la contraseña", "text-danger", "text-danger fa-solid fa-circle-xmark", false];
	}
	else {

		if (password == repeatedPassword) {
			retArray = ["repeatPassword", 'custom-is-valid',
				"Las contraseñas coinciden", "text-success", "text-success fa-solid fa-check", true];
		}
		else {
			retArray = ["repeatPassword", 'custom-is-invalid',
				"Las contraseñas no coinciden", "text-danger", "text-danger fa-solid fa-circle-xmark", false];
		}
	}
	return retArray;
}