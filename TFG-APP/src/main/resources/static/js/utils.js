
new Vue({
	el: "#utils",
	data: function() {
		return {
			columnaNombreOrdenada: false,
			columnaApellidosOrdenada: false,
			columnaCorreoOrdenada: false,
			columnaDniOrdenada: false,
			columnaPrediccionesOrdenada: false
		}
	},

	methods: {

		howToOrderColumn(columnName) {
			const THIZ = this;
			switch (columnName) {

				case "nombre":

					if (this.columnaNombreOrdenada) {
						THIZ.columnaNombreOrdenada = false;
					}
					else {
						THIZ.columnaNombreOrdenada = true;
					}

					this.changeIcon(columnName, this.columnaNombreOrdenada);

					this.sortColumn(columnName, this.columnaNombreOrdenada, "medicosRegistradosTable");
					break;
				case "apellidos":

					if (this.columnaApellidosOrdenada) {
						THIZ.columnaApellidosOrdenada = false;
					}
					else {
						THIZ.columnaApellidosOrdenada = true;
					}

					this.changeIcon(columnName, this.columnaApellidosOrdenada);

					this.sortColumn(columnName, this.columnaApellidosOrdenada, "medicosRegistradosTable");
					break;
				case "correo":

					if (this.columnaCorreoOrdenada) {
						THIZ.columnaCorreoOrdenada = false;
					}
					else {
						THIZ.columnaCorreoOrdenada = true;
					}

					this.changeIcon(columnName, this.columnaCorreoOrdenada);

					this.sortColumn(columnName, this.columnaCorreoOrdenada, "medicosRegistradosTable");
					break;
				case "dni":

					if (this.columnaDniOrdenada) {
						THIZ.columnaDniOrdenada = false;
					}
					else {
						THIZ.columnaDniOrdenada = true;
					}

					this.changeIcon(columnName, this.columnaDniOrdenada);

					this.sortColumn(columnName, this.columnaDniOrdenada, "medicosRegistradosTable");
					break;
				case "prediccion":

					if (this.columnaPrediccionesOrdenada) {
						THIZ.columnaPrediccionesOrdenada = false;
					}
					else {
						THIZ.columnaPrediccionesOrdenada = true;
					}

					this.changeIcon(columnName, this.columnaPrediccionesOrdenada);

					this.sortColumn(columnName, this.columnaPrediccionesOrdenada, "prediccionesRegistradasTable");
					break;
				default:
					break;
			}
		},

		sortColumn(columnName, ordenarAZ, tabla) {

			let table = document.getElementById(tabla);

			let rows = table.rows;

			let values = [];

			switch (tabla) {
				case "medicosRegistradosTable":
					for (let i = 1; i < rows.length; i++) {
						let dict = {};
						dict["nombre"] = rows[i].getElementsByTagName("TD")[0].innerHTML;
						dict["apellidos"] = rows[i].getElementsByTagName("TD")[1].innerHTML;
						dict["correo"] = rows[i].getElementsByTagName("TD")[2].innerHTML;
						dict["dni"] = rows[i].getElementsByTagName("TD")[3].innerHTML;

						values.push(dict);
					}

					if (ordenarAZ) {
						values.sort(function(a, b) {
							if (a[columnName].toLowerCase() < b[columnName].toLowerCase()) {
								return -1;
							}
							if (a[columnName].toLowerCase() > b[columnName].toLowerCase()) {
								return 1;
							}
							return 0;
						});
					}
					else {
						values.sort(function(a, b) {
							if (a[columnName].toLowerCase() < b[columnName].toLowerCase()) {
								return 1;
							}
							if (a[columnName].toLowerCase() > b[columnName].toLowerCase()) {
								return -1;
							}
							return 0;
						});
					}


					for (let i = 1; i < rows.length; i++) {
						rows[i].getElementsByTagName("TD")[0].innerHTML = values[i - 1].nombre;
						rows[i].getElementsByTagName("TD")[1].innerHTML = values[i - 1].apellidos;
						rows[i].getElementsByTagName("TD")[2].innerHTML = values[i - 1].correo;
						rows[i].getElementsByTagName("TD")[3].innerHTML = values[i - 1].dni;
					}
					break;
				case "prediccionesRegistradasTable":

					for (let i = 1; i < rows.length; i++) {
						let dict = {};
						dict["prediccion"] = rows[i].getElementsByTagName("TD")[0].innerHTML;
						values.push(dict);
					}

					if (ordenarAZ) {
						values.sort(function(a, b) {
							if (a[columnName].toLowerCase() < b[columnName].toLowerCase()) {
								return -1;
							}
							if (a[columnName].toLowerCase() > b[columnName].toLowerCase()) {
								return 1;
							}
							return 0;
						});
					}
					else {
						values.sort(function(a, b) {
							if (a[columnName].toLowerCase() < b[columnName].toLowerCase()) {
								return 1;
							}
							if (a[columnName].toLowerCase() > b[columnName].toLowerCase()) {
								return -1;
							}
							return 0;
						});
					}


					for (let i = 1; i < rows.length; i++) {
						rows[i].getElementsByTagName("TD")[0].innerHTML = values[i - 1].prediccion;
					}
					break;
				default:
					break;
			}



		},
		changeIcon(columnName, ordenarAZ) {

			let icono = document.getElementById("icono" + columnName);

			if (ordenarAZ) {
				icono.setAttribute("class", "fa-solid fa-arrow-down-z-a fs-5");
			}
			else {
				icono.setAttribute("class", "fa-solid fa-arrow-up-z-a fs-5");
			}
		}
	}
})

Vue.component('overview', {
	props: ['statistics'],

	data: function() {
		return {
			datasetStatistics: [],
		}
	},

	created() {
		const THIZ = this;
		THIZ.datasetStatistics = this.statistics;
	},

	template: `
	<div class="pt-2">
		<table class="table table-condensed stats">
			<h5>Dataset statistics</h5>
			<tbody>
				<tr v-for="estadistica in datasetStatistics">
					<th>{{estadistica.nombre}}</th>
					<td>{{estadistica.valor}}</td>
				</tr>
			</tbody>
		</table>
	</div>
	`
});

Vue.component('variables', {
	props: ['variable'],
	data: function() {
		return {
			datosCargados: false,
			dataKeys: [],
			dataValues: []
		}
	},

	watch: {
		variable() {
			const THIZ = this;
			let l = Object.values(this.variable)[1].length;
			//if(this.muestraGrafico) var grafico = document.getElementById('grafico').remove();
			let array = new Array(l);
			array = Object.values(this.variable)[1];
			THIZ.dataKeys = [];
			THIZ.dataValues = [];
			for (i = 0; i < l; i++) {
				THIZ.dataKeys[i] = String(Object.keys(array[i]));
				THIZ.dataValues[i] = parseInt(Object.values(array[i]));
			}
			THIZ.datosCargados = true;
		}
	},


	template: `
	<div v-if="datosCargados" class="pt-2">
		<graphic :dataKeys="this.dataKeys" :dataValues="this.dataValues" :titulo="this.variable.feature"/> 
	</div>	
	`
});

Vue.component('graphic', {
	props: {
		dataKeys: Array,
		dataValues: Array,
		titulo: String
	},

	methods: {
		generarGrafica() {
			var ctx = document.getElementById('graphicCanvas').getContext('2d');
			if (window.grafica) {
				window.grafica.clear();
				window.grafica.destroy();
			}
			window.grafica = new Chart(ctx, {
				type: 'pie',
				data: {
					labels: this.dataKeys,
					datasets: [{
						data: this.dataValues,
						backgroundColor: [
							'rgba(255, 0, 0, 0.4)',
							'rgba(5, 239, 50, 0.4)',
							'rgba(1, 0, 169, 0.4)',
							'rgba(220, 241, 2, 0.4)',
							'rgba(117, 117, 117, 0.4)',
							'rgba(124, 32, 93, 0.4)',
							'rgba(116, 124, 32, 0.4)',
							'rgba(0, 124, 216, 0.4)'
						],
						borderColor: [
							'rgba(255, 0, 0, 0.6)',
							'rgba(5, 239, 50, 0.6)',
							'rgba(1, 0, 169, 0.6)',
							'rgba(220, 241, 2, 0.6)',
							'rgba(117, 117, 117, 0.6)',
							'rgba(124, 32, 93, 0.6)',
							'rgba(116, 124, 32, 0.6)',
							'rgba(0, 124, 216, 0.6)'
						],
						borderWidth: 1,
						hoverOffset: 20
					}],
				},
				options: {
					indexAxis: 'y',
					layout: {
						padding: {
							bottom: 10
						}
					},
					plugins: {
						legend: {
							position: 'top',
						},
						title: {
							display: true,
							text: this.titulo,
						},
						datalabels: {
							font: {
								weight: 'bold'
							},
							align: 'end',
							formatter: (value, context) => {
								const datapoints = context.chart.data.datasets[0].data;
								function totalSum(total, datapoint) {
									return total + datapoint;
								}
								const porcentajeTotal = datapoints.reduce(totalSum, 0);
								const porcentaje = (value / porcentajeTotal * 100).toFixed(1);
								const display = [`${value}`, `${porcentaje}%`];
								return display;
							}
						}
					}
				},
				plugins: [ChartDataLabels]
			})
		}
	},

	mounted() {
		this.generarGrafica();
	},

	watch: {
		titulo() {
			this.generarGrafica();
		}
	},

	template: `
	<div class="col-12">	
		<canvas id="graphicCanvas"></canvas>
	</div>
	`
});

