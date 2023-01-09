Vue.component('adios', {

	data: function() {
		return {
			mensaje: 'adios'
		};
	},

	template: `
    <div>
		  <p>{{mensaje}}</p>
	</div>`
});

new Vue({
	el: '#index',
	data: function() {
		return {
			mensaje: 'hola'
		};
	},

	template: `
    <div>
    	<p>{{mensaje}}</p>
    	<adios/>
    </div>
    `
});