

new Vue({
	el: "#loginForm",
	data: function() {
		return {
			mostrarPassword: false
		}
	},
	
	methods: {
		
		mostrar_password(){
			let passwordInput = document.getElementById('password');			
			
			if(!this.mostrarPassword){
				passwordInput.setAttribute("type", "text");	
				this.mostrarPassword = true;
			}
			else{
				passwordInput.setAttribute("type", "password");
				this.mostrarPassword = false;
			}
		},
		
	}
})