
import { validarNombre } from './validacionFrontendUsuario.js';
import { validarApellidos } from './validacionFrontendUsuario.js';
import { validarCorreo } from './validacionFrontendUsuario.js';
import { validarDni } from './validacionFrontendUsuario.js';
import { validarPassword } from './validacionFrontendUsuario.js';
import { validarRepeatPassword } from './validacionFrontendUsuario.js';

new Vue({
	el: "#perfilUsuarioApp",
	data: function() {
		return {
			idUsuario: '',
			backErrorMessage: '',
			notSessionUserMessageError: '',
			mostrarPasswords: false,
			usuario: {
				nombre: {
					valorOriginal: '',
					placeholder: '',
					valorModificado: '',
					modal: '',
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: '',
					inputTextColor: '',
					valido: false
				},
				apellidos: {
					valorOriginal: '',
					placeholder: '',
					valorModificado: '',
					modal: '',
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: '',
					inputTextColor: '',
					valido: false
				},
				correo: {
					valorOriginal: '',
					placeholder: '',
					valorModificado: '',
					modal: '',
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: '',
					inputTextColor: '',
					valido: false
				},
				dni: {
					valorOriginal: '',
					placeholder: '',
					valorModificado: '',
					modal: '',
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: '',
					inputTextColor: '',
					valido: false
				},
				password: {
					valorOriginal: '',
					placeholder: '•••••••••',
					valorModificado: '',
					modal: '',
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: '',
					inputTextColor: '',
					valido: false
				},
				repeatPassword: {
					valorRepeatedPassword: '',
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: '',
					valido: false
				}
			},
		}
	},
	mounted() {
		const THIZ = this;

		THIZ.idUsuario = this.$el.getAttribute('data-idUsuario');


		this.obtenerDatosUsuario();

	},

	methods: {

		obtenerDatosUsuario() {

			const THIZ = this;

			THIZ.notSessionUserMessageError = '';

			fetch(window.location.origin + "/obtenerDatosPerfilUsuario?idUsuario=" + this.idUsuario, {
				method: "GET",
			})
				.then(async res => {

					if (!res.ok) {
						const errorMessage = await res.text();
						THIZ.notSessionUserMessageError = errorMessage;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.json();
				})
				.then(data => {

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

			THIZ.notSessionUserMessageError = '';

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
				.then(async res => {

					if (!res.ok) {
						const errorMessage = await res.text();

						if (res.status === 400) {
							THIZ.backErrorMessage = errorMessage;
							throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
						}
						else if (res.status === 403) {
							THIZ.notSessionUserMessageError = errorMessage;
							throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
						}

					}

					return res.text();
				})
				.then(message => {

					this.usuario[inputName].modal.hide();
					this.obtenerDatosUsuario();

				})
				.catch(error => console.error(error))


		},
		actualizarVariables(inputName, validationInputClass, validationInputMessage, validationInputMessageClass, validationIconClass, inputTextColor, valido) {
			this.usuario[inputName].validationInputClass = validationInputClass;
			this.usuario[inputName].validationInputMessage = validationInputMessage;
			this.usuario[inputName].validationInputMessageClass = validationInputMessageClass;
			this.usuario[inputName].validationIconClass = validationIconClass;
			this.usuario[inputName].inputTextColor = inputTextColor;
			this.usuario[inputName].valido = valido;
		},
		comprobarValidacionNombre() {

			let retArray = validarNombre(this.usuario.nombre.valorModificado);

			this.actualizarVariables(retArray[0], retArray[1], retArray[2], retArray[3], retArray[4], retArray[5], retArray[6]);
		},
		comprobarValidacionApellidos() {

			let retArray = validarApellidos(this.usuario.apellidos.valorModificado);

			this.actualizarVariables(retArray[0], retArray[1], retArray[2], retArray[3], retArray[4], retArray[5], retArray[6]);

		},
		comprobarValidacionCorreo() {

			fetch(window.location.origin + "/comprobarCorreoUnico?correo=" + encodeURIComponent(this.usuario.correo.valorModificado), {
				method: "GET"
			})
				.then(res => res.json())
				.then(correoExiste => {
					let retArray = validarCorreo(this.usuario.correo.valorModificado, correoExiste);

					this.actualizarVariables(retArray[0], retArray[1], retArray[2], retArray[3], retArray[4], retArray[5], retArray[6]);
				})
				.catch(err => console.log(err));
		},
		comprobarValidacionDni() {

			fetch(window.location.origin + "/comprobarDNIUnico?dni=" + encodeURIComponent(this.usuario.dni.valorModificado), {
				method: "GET"
			})
				.then(res => res.json())
				.then(dniExiste => {
					let retArray = validarDni(this.usuario.dni.valorModificado, dniExiste);

					this.actualizarVariables(retArray[0], retArray[1], retArray[2], retArray[3], retArray[4], retArray[5], retArray[6]);
				})
				.catch(err => console.log(err));

		},
		comprobarValidacionPassword() {
			
			let retArray = validarPassword(this.usuario.password.valorModificado);

			this.actualizarVariables(retArray[0], retArray[1], retArray[2], retArray[3], retArray[4], retArray[5], retArray[6]);

		},
		comprobarValidacionRepeatPassword() {
			
			let retArray = validarRepeatPassword(this.usuario.password.valorModificado, this.usuario.repeatPassword.valorRepeatedPassword);

			this.actualizarVariables(retArray[0], retArray[1], retArray[2], retArray[3], retArray[4], retArray[5], retArray[6]);

		},
		mostrar_passwords() {
			let passwordInput = document.getElementById('nuevaPassword');
			let repeatPasswordInput = document.getElementById('repetirNuevaPassword');

			if (!this.mostrarPasswords) {
				passwordInput.setAttribute("type", "text");
				repeatPasswordInput.setAttribute("type", "text");
				this.mostrarPasswords = true;
			}
			else {
				passwordInput.setAttribute("type", "password");
				repeatPasswordInput.setAttribute("type", "password");
				this.mostrarPasswords = false;
			}
		}

		//TO DO
		//Asegurarse que ningún usuario puede modificar datos que no sean los suyos (los de su sesión)

		//Que en la validación frontend si permita dejar el correo y el dni tal y como estaban siempre y cuando sean sus antiguos dni y correo

		//Hacer un poco más dinámico el código
	}
})