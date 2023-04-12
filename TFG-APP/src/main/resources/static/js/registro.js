new Vue({
	el: "#registrationValidation",
	data: function() {
		return {
			inputs: {
				nombre: {
					text: '',
					clase: '',
					valido: false
				},
				apellido: {
					text: '',
					clase: '',
					valido: false
				},
				correo: {
					text: '',
					clase: '',
					valido: false
				},
				dni: {
					text: '',
					clase: '',
					valido: false
				},
				password: {
					text: '',
					clase: '',
					valido: false
				},
				repeatPassword: {
					text: '',
					clase: '',
					valido: false
				}
			}
		}
	},

	methods: {
		validar_nombre(){
			if(this.inputs.nombre.text==''){
				this.inputs.nombre.clase = '';
				this.inputs.nombre.valido = false;
			}
			else{
				
				const regex = /^[A-Z][a-z]*([ ][A-Z][a-z]*)*$/;
				
				if(regex.test(this.inputs.nombre.text)){
					this.inputs.nombre.clase= 'border border-3 border-success'
					this.inputs.nombre.valido = true;
				}
				else{
					this.inputs.nombre.clase= 'border border-3 border-danger'
					this.inputs.nombre.valido = false;
				}
			}
		},
		validar_apellido(){
			if(this.inputs.apellido.text==''){
				this.inputs.apellido.clase = '';
				this.inputs.apellido.valido = false;
			}
			else{
				
				const regex = /^[A-Z][a-z]*([ ][A-Z][a-z]*)*$/;
				
				if(regex.test(this.inputs.apellido.text)){
					this.inputs.apellido.clase= 'border border-3 border-success'
					this.inputs.apellido.valido = true;
				}
				else{
					this.inputs.apellido.clase= 'border border-3 border-danger'
					this.inputs.apellido.valido = false;
				}
			}
		},
		validar_correo(){
			if(this.inputs.correo.text==''){
				this.inputs.correo.clase = '';
				this.inputs.correo.valido = false;
			}
			else{
				
				const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
				
				if(regex.test(this.inputs.correo.text)){
					this.inputs.correo.clase= 'border border-3 border-success'
					this.inputs.correo.valido = true;
				}
				else{
					this.inputs.correo.clase= 'border border-3 border-danger'
					this.inputs.correo.valido = false;
				}
			}
		},
		validar_dni(){
			if(this.inputs.dni.text==''){
				this.inputs.dni.clase = '';
				this.inputs.dni.valido = false;
			}
			else{
				
				const regex = /^[XYZ]\d{7}[TRWAGMYFPDXBNJZSQVHLCKE]$|^\d{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
				
				if(regex.test(this.inputs.dni.text)){
					this.inputs.dni.clase= 'border border-3 border-success'
					this.inputs.dni.valido = true;
				}
				else{
					this.inputs.dni.clase= 'border border-3 border-danger'
					this.inputs.dni.valido = false;
				}
			}
		},
		validar_password(){
			if(this.inputs.password.text==''){
				this.inputs.password.clase = '';
				this.inputs.password.valido = false;
			}
			else{
				
				const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
				
				if(regex.test(this.inputs.password.text)){
					this.inputs.password.clase= 'border border-3 border-success'
					this.inputs.password.valido = true;
				}
				else{
					this.inputs.password.clase= 'border border-3 border-danger'
					this.inputs.password.valido = false;
				}
			}
		},
		validar_repeatPassword(){
			if(this.inputs.repeatPassword.text==''){
				this.inputs.repeatPassword.clase = '';
				this.inputs.repeatPassword.valido = false;
			}
			else{
				
				const regex = /^[A-Z][a-z]*([ ][A-Z][a-z]*)*$/;
				
				if(regex.test(this.inputs.repeatPassword.text)){
					this.inputs.repeatPassword.clase= 'border border-3 border-success'
					this.inputs.repeatPassword.valido = true;
				}
				else{
					this.inputs.repeatPassword.clase= 'border border-3 border-danger'
					this.inputs.repeatPassword.valido = false;
				}
			}
		},
		handleSubmit(event){
			event.preventDefault();
			alert("No puedes enviar el formulario");
		}
	}
})