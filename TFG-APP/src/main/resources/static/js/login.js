

new Vue({
	el: "#loginForm",
	data: function() {
		return {
			isMouseDown: false,
			inputName: "password",
			buttonName: "button-password"
		}
	},
	
	methods: {
		onMouseLeave() {
			
			if (this.isMouseDown) {
				this.onMouseUp();
			}
		},

		onMouseDown() {
			let passwordInput = document.getElementById(this.inputName);
			let icon = document.getElementById(this.buttonName).firstElementChild;

			icon.setAttribute("class", "fa-solid fa-eye fs-5");
			passwordInput.setAttribute("type", "text");
			
			this.isMouseDown = true;

		},

		onMouseUp() {
			let passwordInput = document.getElementById(this.inputName);
			let icon = document.getElementById(this.buttonName).firstElementChild;

			icon.setAttribute("class", "fa-solid fa-eye-slash fs-5");
			passwordInput.setAttribute("type", "password");
			
			this.isMouseDown = false;
			
		}
	}
})