new Vue({
	el: '#login',
	data: function() {
		return {
			mensaje: 'hola'
		};
	},

	template: `
    <div>
    	<div class="login-page">
		  <div class="form">
		    <form class="register-form">
		      <input type="dni" placeholder="Dni"/>
		      <input type="password" placeholder="Password"/>
		      <input type="text" placeholder="email address"/>
		      <button>create</button>
		      <p class="message">Already registered? <a href="#">Sign In</a></p>
		    </form>
		    <form class="login-form">
		      <input type="text" placeholder="Dni"/>
		      <input type="password" placeholder="Password"/>
		      <button>login</button>
		      <p class="message">Not registered? <a href="#">Create an account</a></p>
		    </form>
		  </div>
		</div>
    </div>
    `
});