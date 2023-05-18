import { validarNombre } from './validacionFrontendUsuario.js';
import { validarApellidos } from './validacionFrontendUsuario.js';
import { validarCorreo } from './validacionFrontendUsuario.js';
import { validarDni } from './validacionFrontendUsuario.js';
import { validarPassword } from './validacionFrontendUsuario.js';
import { validarRepeatPassword } from './validacionFrontendUsuario.js';

new Vue({
	el: "#registrationValidation",
	data: function() {
		return {

			mostrarPasswords: false,
			inputs: {
				nombre: {
					text: '',
					valido: false,
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: ''
				},
				apellidos: {
					text: '',
					valido: false,
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: ''
				},
				correo: {
					text: '',
					valido: false,
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: ''
				},
				dni: {
					text: '',
					valido: false,
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: ''
				},
				password: {
					text: '',
					valido: false,
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: ''
				},
				repeatPassword: {
					text: '',
					valido: false,
					validationInputClass: '',
					validationInputMessage: '',
					validationInputMessageClass: '',
					validationIconClass: ''
				}
			}
		}
	},

	methods: {

		actualizarVariables(inputName, validationInputClass, validationInputMessage, validationInputMessageClass, validationIconClass, valido) {
			this.inputs[inputName].validationInputClass = validationInputClass;
			this.inputs[inputName].validationInputMessage = validationInputMessage;
			this.inputs[inputName].validationInputMessageClass = validationInputMessageClass;
			this.inputs[inputName].validationIconClass = validationIconClass;
			this.inputs[inputName].valido = valido;
		},

		comprobarValidacionNombre() {

			let retArray = validarNombre(this.inputs.nombre.text);

			this.actualizarVariables(retArray[0], retArray[1], retArray[2], retArray[3], retArray[4], retArray[5]);

		},
		comprobarValidacionApellidos() {

			let retArray = validarApellidos(this.inputs.apellidos.text);

			this.actualizarVariables(retArray[0], retArray[1], retArray[2], retArray[3], retArray[4], retArray[5]);

		},
		comprobarValidacionCorreo() {
			fetch(window.location.origin + "/comprobarCorreoUnico?correo=" + encodeURIComponent(this.inputs.correo.text), {
				method: "GET"
			})
				.then(res => res.json())
				.then(correoExiste => {
					let retArray = validarCorreo(this.inputs.correo.text, correoExiste);

					this.actualizarVariables(retArray[0], retArray[1], retArray[2], retArray[3], retArray[4], retArray[5]);
				})
				.catch(err => console.log(err));
		},
		comprobarValidacionDni() {

			fetch(window.location.origin + "/comprobarDNIUnico?dni=" + encodeURIComponent(this.inputs.dni.text), {
				method: "GET"
			})
				.then(res => res.json())
				.then(dniExiste => {
					let retArray = validarDni(this.inputs.dni.text, dniExiste);

					this.actualizarVariables(retArray[0], retArray[1], retArray[2], retArray[3], retArray[4], retArray[5]);
				})
				.catch(err => console.log(err));
		},
		comprobarValidacionPassword() {

			let retArray = validarPassword(this.inputs.password.text);

			this.actualizarVariables(retArray[0], retArray[1], retArray[2], retArray[3], retArray[4], retArray[5]);
			
		},
		comprobarValidacionRepeatPassword() {

			let retArray = validarRepeatPassword(this.inputs.password.text, this.inputs.repeatPassword.text);

			this.actualizarVariables(retArray[0], retArray[1], retArray[2], retArray[3], retArray[4], retArray[5]);
		},

		mostrar_passwords() {
			let passwordInput = document.getElementById('password');
			let repeatPasswordInput = document.getElementById('repeatPassword');

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