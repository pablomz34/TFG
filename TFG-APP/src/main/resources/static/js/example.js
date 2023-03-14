new Vue({
	el: "#example",
	data: function() {
		return {
			message: "Hello World",
		}
	},

	template: `
	<div>
		<p>{{message}}</p>
	</div>
	`
})