

new Vue({
	el: "#perfilUsuarioApp",
	data: function() {
		return {
			idUsuario: '',
			backErrorMessage: '',
			usuario: {
				nombre: {
					valorOriginal: '',
					placeholder: '',
					valorModificado: '',
					modal: '',
					regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*)*$/,
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: ''
				},
				apellidos: {
					valorOriginal: '',
					placeholder: '',
					valorModificado: '',
					modal: '',
					regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*)*$/,
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: ''
				},
				correo: {
					valorOriginal: '',
					placeholder: '',
					valorModificado: '',
					modal: '',
					regex: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: ''
				},
				dni: {
					valorOriginal: '',
					placeholder: '',
					valorModificado: '',
					modal: '',
					regex: /^[XYZ]\d{7}[TRWAGMYFPDXBNJZSQVHLCKE]$|^\d{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/,
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					iconClass: ''
				},
				password: {
					valorOriginal: '',
					placeholder: '•••••••••',
					valorModificado: '',
					modal: '',
					regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: ''
				},
				repeatPassword: {
					valorRepeatedPassword: '',
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: ''
				}
			},
		}
	},
	mounted() {
		const THIZ = this;

		THIZ.idUsuario = this.$el.getAttribute('data-idUsuario');

		fetch(window.location.origin + "/obtenerDatosPerfilUsuario?idUsuario=" + this.idUsuario, {
			method: "GET",
		})
			.then(res => res.json())
			.then(data => {
				const THIZ = this;
				THIZ.usuario.nombre.valorOriginal = data.nombre;
				THIZ.usuario.apellidos.valorOriginal = data.apellidos;
				THIZ.usuario.correo.valorOriginal = data.correo;
				THIZ.usuario.dni.valorOriginal = data.dni;
				THIZ.usuario.password.valorOriginal = data.password;
				THIZ.usuario.nombre.placeholder = data.nombre;
				THIZ.usuario.apellidos.placeholder = data.apellidos;
				THIZ.usuario.correo.placeholder = data.correo;
				THIZ.usuario.dni.placeholder = data.dni;
			})
			.catch(error => console.error(error))
	},

	methods: {

		obtenerDatosUsuario() {
			fetch(window.location.origin + "/obtenerDatosPerfilUsuario?idUsuario=" + this.idUsuario, {
				method: "GET",
			})
				.then(res => res.json())
				.then(data => {
					const THIZ = this;
					THIZ.usuario.nombre.valorOriginal = data.nombre;
					THIZ.usuario.apellidos.valorOriginal = data.apellidos;
					THIZ.usuario.correo.valorOriginal = data.correo;
					THIZ.usuario.dni.valorOriginal = data.dni;
					THIZ.usuario.password.valorOriginal = data.password;
					THIZ.usuario.nombre.placeholder = data.nombre;
					THIZ.usuario.apellidos.placeholder = data.apellidos;
					THIZ.usuario.correo.placeholder = data.correo;
					THIZ.usuario.dni.placeholder = data.dni;
				})
				.catch(error => console.error(error))
		},

		showToast(inputName, toastName) {
			const THIZ = this;
			THIZ.backErrorMessage = '';


			THIZ.usuario[inputName].validationInputClass = '';
			THIZ.usuario[inputName].validationInputMessage = '';
			THIZ.usuario[inputName].validationInputMessageClass = '';
			THIZ.usuario[inputName].validationIconClass = '';
			THIZ.usuario[inputName].valorModificado = '';

			if (inputName === 'password') {
				THIZ.usuario.repeatPassword.validationInputClass = '';
				THIZ.usuario.repeatPassword.validationInputMessage = '';
				THIZ.usuario.repeatPassword.validationInputMessageClass = '';
				THIZ.usuario.repeatPassword.validationIconClass = '';
				THIZ.usuario.repeatPassword.valorRepeatedPassword = '';
			}

			if (this.usuario[inputName].modal.length === 0) {
				let modal = new bootstrap.Modal(document.getElementById(toastName));
				THIZ.usuario[inputName].modal = modal;
			}

			this.usuario[inputName].modal.show();

		},
		cambiarDatoPerfilUsuario(inputName) {

			const THIZ = this;
			let json = {}



			json["dato"] = this.usuario[inputName].valorModificado;
			json["columnName"] = inputName;

			if (inputName === 'password') {
				json["repeatPassword"] = this.usuario.repeatPassword.valorRepeatedPassword;
			}
			else {
				json["repeatPassword"] = '';
			}

			fetch(window.location.origin + "/cambiarDatoPerfilUsuario?idUsuario=" + this.idUsuario, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json' // Tipo de contenido del cuerpo de la solicitud
				},
				body: JSON.stringify(json)
			})
				.then(res => res.text())
				.then(message => {

					if (message.length > 0) {
						THIZ.backErrorMessage = message;
					}
					else {
						this.usuario[inputName].modal.hide();
						this.obtenerDatosUsuario();
					}

				})
				.catch(error => console.error(error))


		},
		actualizar_variables(inputName, validationInputClass, validationInputMessage, validationInputMessageClass, validationIconClass) {
			this.usuario[inputName].validationInputClass = validationInputClass;
			this.usuario[inputName].validationInputMessage = validationInputMessage;
			this.usuario[inputName].validationInputMessageClass = validationInputMessageClass;
			this.usuario[inputName].validationIconClass = validationIconClass;
		},
		validarNombre() {


			if (this.usuario.nombre.valorModificado == '') {

				this.actualizar_variables("nombre", 'custom-is-invalid',
					"El nombre no puede estar vacío", "text-danger", "text-danger fa-solid fa-circle-xmark");
			}
			else {

				if (this.usuario.nombre.regex.test(this.usuario.nombre.valorModificado)) {

					this.actualizar_variables("nombre", 'custom-is-valid',
						"El nombre es correcto", "text-success", "text-success fa-solid fa-check");
				}
				else {

					this.actualizar_variables("nombre", 'custom-is-invalid',
						"El nombre no puede contener números ni caracteres no alfanuméricos", "text-danger", "text-danger fa-solid fa-circle-exclamation");
				}
			}
		},
		validarApellidos() {

			if (this.usuario.apellidos.valorModificado == '') {

				this.actualizar_variables("apellidos", 'custom-is-invalid',
					"Los apellidos no puede estar vacíos", "text-danger", "text-danger fa-solid fa-circle-xmark");
			}
			else {


				if (this.usuario.apellidos.regex.test(this.usuario.apellidos.valorModificado)) {

					this.actualizar_variables("apellidos", 'custom-is-valid',
						"Los apellidos son correctos", "text-success", "text-success fa-solid fa-check");
				}
				else {

					this.actualizar_variables("apellidos", 'custom-is-invalid',
						"Los apellidos no puede contener números ni caracteres no alfanuméricos", "text-danger", "text-danger fa-solid fa-circle-xmark");
				}
			}

		},
		validarCorreo() {



			if (this.usuario.correo.valorModificado == '') {

				this.actualizar_variables("correo", 'custom-is-invalid',
					"El correo no puede estar vacío", "text-danger", "text-danger fa-solid fa-circle-xmark");

			}
			else {

				if (this.usuario.correo.regex.test(this.usuario.correo.valorModificado)) {

					fetch(window.location.origin + "/comprobarCorreoUnico?correo=" + encodeURIComponent(this.usuario.correo.valorModificado), {
						method: "GET"
					})
						.then(res => res.json())
						.then(medico => {
							if (medico) {
								this.actualizar_variables("correo", 'custom-is-invalid',
									"El correo ya está registrado", "text-danger", "text-danger fa-solid fa-circle-xmark");
							}
							else {
								this.actualizar_variables("correo", 'custom-is-valid',
									"El correo es válido", "text-success", "text-success fa-solid fa-check");
							}
						})
						.catch(err => console.log(err));
				}
				else {

					this.actualizar_variables("correo", 'custom-is-invalid',
						"El correo tiene que tener un formato válido, ejemplo: prueba@gmail.com", "text-danger", "text-danger fa-solid fa-circle-xmark");

				}
			}
		},
		validarDni() {


			if (this.usuario.dni.valorModificado == '') {
				this.actualizar_variables("dni", 'custom-is-invalid',
					"El NIF/NIE no puede estar vacío", "text-danger", "text-danger fa-solid fa-circle-xmark");
			}
			else {


				if (this.usuario.dni.regex.test(this.usuario.dni.valorModificado)) {

					if (this.validarDigitoDeControlDni(this.usuario.dni.valorModificado)) {

						fetch(window.location.origin + "/comprobarDNIUnico?dni=" + encodeURIComponent(this.usuario.dni.valorModificado), {
							method: "GET"
						})
							.then(res => res.json())
							.then(medico => {
								if (medico) {
									this.actualizar_variables("dni", 'custom-is-invalid',
										"El NIF/NIE ya está en uso", "text-danger", "text-danger fa-solid fa-circle-xmark");
								}
								else {
									this.actualizar_variables("dni", 'custom-is-valid',
										"El NIF/NIE es válido", "text-success", "text-success fa-solid fa-check");
								}
							})
							.catch(err => console.log(err));

					}
					else {
						this.actualizar_variables("dni", 'custom-is-invalid',
							"El dígito de control del NIF/NIE no es válido", "text-danger", "text-danger fa-solid fa-circle-xmark");
					}


				}
				else {
					this.actualizar_variables("dni", 'custom-is-invalid',
						"El NIF/NIE tiene que tener un formato válido, ejemplo: 12345678Z o X1234567L", "text-danger", "text-danger fa-solid fa-circle-xmark");
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
		validarPassword() {

			if (this.usuario.password.valorModificado == '') {
				this.actualizar_variables("password", 'custom-is-invalid',
					"La contraseña no puede estar vacía", "text-danger", "text-danger fa-solid fa-circle-xmark");
			}
			else {

				if (this.usuario.password.regex.test(this.usuario.password.valorModificado)) {
					this.actualizar_variables("password", 'custom-is-valid',
						"Las contraseña es correcta", "text-success", "text-success fa-solid fa-check");
				}
				else {
					this.actualizar_variables("password", 'custom-is-invalid',
						"La contraseña debe tener un mínimo de 8 caracteres de longitud y también una letra minúscula y otra mayúscula, un caracter no alfanumérico y un número", "text-danger", "text-danger fa-solid fa-circle-xmark");
				}
			}
		},
		validarRepeatPassword() {


			if (this.usuario.repeatPassword.valorRepeatedPassword == '') {
				this.actualizar_variables("repeatPassword", 'custom-is-invalid',
					"Por favor, repita la contraseña", "text-danger", "text-danger fa-solid fa-circle-xmark");
			}
			else {

				if (this.usuario.repeatPassword.valorRepeatedPassword == this.usuario.password.valorModificado) {
					this.actualizar_variables("repeatPassword", 'custom-is-valid',
						"Las contraseñas coinciden", "text-success", "text-success fa-solid fa-check");
				}
				else {
					this.actualizar_variables("repeatPassword", 'custom-is-invalid',
						"Las contraseñas no coinciden", "text-danger", "text-danger fa-solid fa-circle-xmark");
				}
			}
		}

		//TO DO
		//Asegurarse que ningún usuario puede modificar datos que no sean los suyos (los de su sesión)

		//Que en la validación frontend si permita dejar el correo y el dni tal y como estaban siempre y cuando sean sus antiguos dni y correo

		//Hacer un poco más dinámico el código
	}
})