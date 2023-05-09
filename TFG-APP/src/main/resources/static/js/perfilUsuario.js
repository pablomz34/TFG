

new Vue({
	el: "#perfilUsuarioApp",
	data: function() {
		return {
			nombreUsuario: '',
			apellidosUsuario: '',
			correoUsuario: '',
			dniUsuario: '',
			passwordUsuario: '',
			placeholderPassword: '••••••••••'
		}
	},
	mounted() {
		const THIZ = this;
		THIZ.nombreUsuario = this.$el.getAttribute('data-usuarioNombre');
		THIZ.apellidosUsuario = this.$el.getAttribute('data-usuarioApellidos');
		THIZ.correoUsuario = this.$el.getAttribute('data-usuarioCorreo');
		THIZ.dniUsuario = this.$el.getAttribute('data-usuarioDni');
		
		THIZ.passwordUsuario = this.$el.getAttribute('data-usuarioPassword');
	},
	
	methods: {
		
		modificarNombre(){
			
		},
		modificarApellidos(){
			
		},
		modificarCorreo(){
			
		},
		modificarDni(){
			
		},
		modificarPassword(){
			
		}
	}
})