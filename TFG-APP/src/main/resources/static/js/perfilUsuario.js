

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
				},
				apellidos: {
					valorOriginal: '',
					placeholder: '',
					valorModificado: '',
					modal: '',
				},
				correo: {
					valorOriginal: '',
					placeholder: '',
					valorModificado: '',
					modal: '',
				},
				dni: {
					valorOriginal: '',
					placeholder: '',
					valorModificado: '',
					modal: '',
				},
				password: {
					valorOriginal: '',
					placeholder: '•••••••••',
					valorModificado: '',
					modal: '',
					repeatPassword: ''
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

			let stringModalInputs = "#" + toastName + " input";

			let inputs = document.querySelectorAll(stringModalInputs);

			for (let i = 0; i < inputs.length; i++) {
				inputs[i].value = "";
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
				json["repeatPassword"] = this.usuario[inputName].repeatPassword;
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
	}
})