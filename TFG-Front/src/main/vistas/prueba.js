Vue.component('componente', {

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
	el: '#prueba',
	data: function() {
		return {
			mensaje: 'hola'
		};
	},

	template: `
    <div>
    	<p>{{mensaje}}</p>
    	<componente/>
    </div>
    `
});