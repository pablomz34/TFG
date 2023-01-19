Vue.component('register',{
	data: function(){
		
	}
	
});


new Vue({
	el: '#login',
	data: function() {
		return {
			showRegister: false,
		};
	},
	
	methods: {
		changeSel(){
			const THIZ = this;
			THIZ.showRegister = ! this.showRegister;
		}
	},

	template: `
    <div>
    	<div class="login-page">
		  <div class="form">
		    <form v-if="showRegister" class="register-form">
		      <input type="dni" placeholder="Dni"/>
		      <input type="password" placeholder="Password"/>
		      <input type="text" placeholder="Correo electronico"/>
		      <button>create</button>
		      <p class="message">Already registered? <a class="button" @click="changeSel()">Sign In</a></p>
		    </form>
		  
		    <form v-else class="login-form">
		      <input type="text" placeholder="Dni"/>
		      <input type="password" placeholder="Password"/>
		      <button>login</button>
		      <p class="message">Not registered? <a class="btn btn-primary" @click="changeSel()">Create an account</a></p>
		    </form>
		  </div>
		</div>
    </div>
    `
});