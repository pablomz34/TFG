

new Vue({
	el: "#registrationValidation",
	data: function() {
		return {
			
			isMouseDown: false,
			inputs: {
				nombre: {
					text: '',
					borderClass: '',
					valido: false,
					validationMessage: '',
					validationMessageClass: ''
				},
				apellidos: {
					text: '',
					borderClass: '',
					valido: false,
					validationMessage: '',
					validationMessageClass: ''
				},
				correo: {
					text: '',
					borderClass: '',
					valido: false,
					validationMessage: '',
					validationMessageClass: ''
				},
				dni: {
					text: '',
					borderClass: '',
					valido: false,
					validationMessage: '',
					validationMessageClass: ''
				},
				password: {
					text: '',
					borderClass: '',
					valido: false,
					validationMessage: '',
					validationMessageClass: ''
				},
				repeatPassword: {
					text: '',
					borderClass: '',
					valido: false,
					validationMessage: '',
					validationMessageClass: ''
				}
			}
		}
	},

	methods: {

		actualizar_variables(variable, borderClass, validationMessage, validationMessageClass, valido) {
			variable.borderClass = borderClass;
			variable.validationMessage = validationMessage;
			variable.validationMessageClass = validationMessageClass;
			variable.valido = valido;
		},

		validar_nombre() {
			let input_name = this.inputs.nombre;

			if (input_name.text == '') {

				this.actualizar_variables(input_name, 'is-invalid',
					"El nombre no puede estar vacío", "text-danger", false);
			}
			else {

				const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*)*$/;

				if (regex.test(input_name.text)) {

					this.actualizar_variables(input_name, 'is-valid',
						"El nombre es correcto", "text-success", true);
				}
				else {

					this.actualizar_variables(input_name, 'is-invalid',
						"El nombre no puede contener números ni caracteres no alfanuméricos", "text-danger", false);
				}
			}
		},
		validar_apellidos() {

			let input_name = this.inputs.apellidos;

			if (input_name.text == '') {

				this.actualizar_variables(input_name, 'is-invalid',
					"Los apellidos no puede estar vacíos", "text-danger", false);
			}
			else {

				const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*)*$/;

				if (regex.test(input_name.text)) {

					this.actualizar_variables(input_name, 'is-valid',
						"Los apellidos son correctos", "text-success", true);
				}
				else {

					this.actualizar_variables(input_name, 'is-invalid',
						"Los apellidos no puede contener números ni caracteres no alfanuméricos", "text-danger", false);
				}
			}

		},
		validar_correo() {

			let input_name = this.inputs.correo;


			if (input_name.text == '') {

				this.actualizar_variables(input_name, 'is-invalid',
					"El correo no puede estar vacío", "text-danger", false);

			}
			else {

				const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

				if (regex.test(input_name.text)) {

					fetch(window.location.origin + "/registro/comprobarCorreo?correo=" + encodeURIComponent(input_name.text), {
						method: "GET"
					})
						.then(res => res.json())
						.then(medico => {
							if (medico) {
								this.actualizar_variables(input_name, 'is-invalid',
									"El correo ya está registrado", "text-danger", false);
							}
							else {
								this.actualizar_variables(input_name, 'is-valid',
									"El correo es válido", "text-success", true);
							}
						})
						.catch(err => console.log(err));
				}
				else {

					this.actualizar_variables(input_name, 'is-invalid',
						"El correo tiene que tener un formato válido, ejemplo: prueba@gmail.com", "text-danger", false);

				}
			}
		},
		validar_dni() {

			let input_name = this.inputs.dni;

			if (input_name.text == '') {
				this.actualizar_variables(input_name, 'is-invalid',
					"El NIF/NIE no puede estar vacío", "text-danger", false);
			}
			else {

				const regex = /^[XYZ]\d{7}[TRWAGMYFPDXBNJZSQVHLCKE]$|^\d{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;

				if (regex.test(input_name.text)) {

					if (this.validarDigitoDeControlDni(input_name.text)) {

						fetch(window.location.origin + "/registro/comprobarDNI?dni=" + encodeURIComponent(input_name.text), {
							method: "GET"
						})
							.then(res => res.json())
							.then(medico => {
								if (medico) {
									this.actualizar_variables(input_name, 'is-invalid',
										"El NIF/NIE ya está en uso", "text-danger", false);
								}
								else {
									this.actualizar_variables(input_name, 'is-valid',
										"El NIF/NIE es válido", "text-success", true);
								}
							})
							.catch(err => console.log(err));

					}
					else {
						this.actualizar_variables(input_name, 'is-invalid',
							"El dígito de control del NIF/NIE no es válido", "text-danger", false);
					}


				}
				else {
					this.actualizar_variables(input_name, 'is-invalid',
						"El NIF/NIE tiene que tener un formato válido, ejemplo: 12345678Z o X1234567L", "text-danger", false);
				}
			}
		},

		validarDigitoDeControlDni(dni) {

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
		},
		validar_password() {

			let input_name = this.inputs.password;

			if (input_name.text == '') {
				this.actualizar_variables(input_name, 'is-invalid',
					"La contraseña no puede estar vacía", "text-danger", false);
			}
			else {

				const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

				if (regex.test(input_name.text)) {
					this.actualizar_variables(input_name, 'is-valid',
						"Las contraseña es correcta", "text-success", true);
				}
				else {
					this.actualizar_variables(input_name, 'is-invalid',
						"La contraseña debe tener un mínimo de 8 caracteres de longitud y también una letra minúscula y otra mayúscula, un caracter no alfanumérico y un número", "text-danger", false);
				}
			}
		},

		onMouseLeave(inputName, buttonName) {
			
			if (this.isMouseDown) {
				
				this.onMouseUp(inputName, buttonName);
			}
		},

		onMouseDown(inputName, buttonName) {
			let passwordInput = document.getElementById(inputName);
			let icon = document.getElementById(buttonName).firstElementChild;

			icon.setAttribute("class", "fa-solid fa-eye fs-5");
			passwordInput.setAttribute("type", "text");
			
			this.isMouseDown = true;

		},

		onMouseUp(inputName, buttonName) {
			let passwordInput = document.getElementById(inputName);
			let icon = document.getElementById(buttonName).firstElementChild;

			icon.setAttribute("class", "fa-solid fa-eye-slash fs-5");
			passwordInput.setAttribute("type", "password");
			
			this.isMouseDown = false;
			
		},

		changePasswordInput() {
			let passwordInput = document.getElementById(inputName);
			let icon = document.getElementById(buttonName).firstElementChild;
			let type_input = passwordInput.getAttribute("type");

			if (type_input == 'password') {
				icon.setAttribute("class", "fa-solid fa-eye fs-5");
				passwordInput.setAttribute("type", "text");
			}
			else if (type_input == 'text') {
				icon.setAttribute("class", "fa-solid fa-eye-slash fs-5");
				passwordInput.setAttribute("type", "password");
			}

		},
		validar_repeatPassword() {

			let input_name = this.inputs.repeatPassword;

			if (input_name.text == '') {
				this.actualizar_variables(input_name, 'is-invalid',
					"Por favor, repita la contraseña", "text-danger", false);
			}
			else {

				if (input_name.text == this.inputs.password.text) {
					this.actualizar_variables(input_name, 'is-valid',
						"Las contraseñas coinciden", "text-success", true);
				}
				else {
					this.actualizar_variables(input_name, 'is-invalid',
						"Las contraseñas no coinciden", "text-danger", false);
				}
			}
		},
		handleSubmit(event) {

			if (this.inputs.nombre.valido && this.inputs.apellidos.valido && this.inputs.correo.valido
				&& this.inputs.dni.valido && this.inputs.password.valido && this.inputs.repeatPassword.valido) {
				document.getElementById("formRegistro").submit();
			}
			else {

				let toast = new bootstrap.Toast(document.getElementById('validationErrorToast'));

				toast.show();

				event.preventDefault();
			}

		}
	}
})