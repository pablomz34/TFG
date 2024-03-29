new Vue({
	el: "#herramientaPredictiva",
	data: function() {
		return {
			herramientaPredictivaInputs: [],
			nCluster: '',
			isPrediccionSelected: false,
			descripciones: [],
			descripcionSeleccionada: '',
			datosCargados: false,
			curvaUrl: '',
			curvaCargada: false,
			idPrediccion: '',
			datasetStatistics: [
				{ nombre: 'Id Prediction', valor: '' },
				{ nombre: 'Number of variables', valor: '' },
				{ nombre: 'Number of observations', valor: '' },
				{ nombre: 'Target median', valor: '' },
				{ nombre: 'Target third quantile', valor: '' },
			],
			variableSeleccionada: '',
			variables: [],
			nombreDescargaCurvas: '',
			error0: '',
			error1: '',
			error2: '',
			mostrarCargando: false,
			mostrarModalAddPaciente: true,
			variableObjetivo: '',
		}
	},

	created() {
		fetch(window.location.origin + "/medico/getDescripcionesPredicciones", {
			method: "GET"
		})
			.then(res => res.json())
			.then(json => {
				for (let i = 0; i < json.length; i++) {
					this.descripciones.push(json[i]);
				}
			})
			.catch(error => console.error(error));
	},

	methods: {
		getPrediccionValues: function() {
			const THIZ = this;
			THIZ.mostrarCargando = true;
			THIZ.error0 = ''
			THIZ.datosCargados = false;
			THIZ.curvaCargada = false;
			THIZ.isPrediccionSelected = false;
			fetch(window.location.origin + "/medico/getIdPrediccion?descripcionPrediccion=" + this.descripcionSeleccionada, {
				method: "GET"
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error0 = errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error en la respuesta del servidor: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.text();
				})
				.then(data => {
					THIZ.idPrediccion = data

					fetch(window.location.origin + "/medico/getFeatures?idPrediccion=" + this.idPrediccion, {
						method: "GET"
					})
						.then(async res => {
							if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
								const errorMessage = await res.text();
								THIZ.error0 = errorMessage;
								THIZ.mostrarCargando = false;
								throw new Error("Error en la respuesta del servidor: " + res.status + " " + res.statusText + " - " + errorMessage);
							}

							return res.json();
						})
						.then(json => {

							THIZ.herramientaPredictivaInputs = [];

							let features = json.features;

							features.shift();

							for (let i = 0; i < features.length; i++) {

								let inputDict = {};
								let feature = features[i];

								let arrayFeature = Object.values(feature)[1];

								inputDict["seleccion"] = '';

								let inputLabelName = Object.values(feature)[0];

								let primerLetraMayuscula = inputLabelName.charAt(0).toUpperCase();
								let restoString = inputLabelName.slice(1).toLowerCase();
								inputLabelName = primerLetraMayuscula + restoString;

								inputDict["nombre"] = inputLabelName;

								inputDict["variables"] = [];

								for (let j = 0; j < arrayFeature.length; j++) {
									inputDict["variables"].push(String(Object.keys(arrayFeature[j])));
								}

								THIZ.herramientaPredictivaInputs.push(inputDict);


							}
							THIZ.isPrediccionSelected = true
							THIZ.error1 = '';
						})
						.catch(error => console.error(error));

				})
				.catch(error => console.error(error));


			THIZ.mostrarCargando = false;

		},

		getNewPatientClassification: function() {
			const THIZ = this;
			THIZ.datosCargados = false;
			THIZ.error1 = '';
			THIZ.curvaCargada = false;
			THIZ.mostrarCargando = true;


			let jsonData = {};
			
			for(let i=0; i<this.herramientaPredictivaInputs.length; i++){
				jsonData[this.herramientaPredictivaInputs[i].nombre.toUpperCase()] = this.herramientaPredictivaInputs[i].seleccion;
			}
			
			
			fetch(window.location.origin + "/medico/getNewPatientClassification?idPrediccion=" + this.idPrediccion, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json' // Tipo de contenido del cuerpo de la solicitud
				},
				body: JSON.stringify(jsonData)
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error1 = errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error en la respuesta del servidor: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.json();
				})
				.then(data => {
					THIZ.nCluster = data.numCluster;
					THIZ.curvaUrl = data.rutaImagen;
					THIZ.nombreDescargaCurvas = 'prediccion' + this.idPrediccion + 'cluster' + this.nCluster + '.png';

					THIZ.datasetStatistics[0].valor = data.clusterData.id_prediction;
					THIZ.datasetStatistics[1].valor = data.clusterData.number_of_variables;
					THIZ.datasetStatistics[2].valor = data.clusterData.number_of_observations;
					THIZ.datasetStatistics[3].valor = data.clusterData.target_median;
					THIZ.datasetStatistics[4].valor = data.clusterData.target_third_quantile;

					THIZ.variables = data.clusterData.features;

					THIZ.datosCargados = true;

					const imageUrl = this.curvaUrl;
					fetch(imageUrl)
						.then(async res => {
							if (res.ok) THIZ.curvaCargada = true;
							else THIZ.curvaCargada = false;
						})
						.catch(error => console.error(error));

					THIZ.mostrarCargando = false;
				})
				.catch(error => console.error(error));
		},

		descargarPdf: function() {
			let jsonData = {};
			let statistics = {};
			let variables = {};
			for (let i = 0; i < this.datasetStatistics.length; i++) {
				statistics[this.datasetStatistics[i].nombre] = this.datasetStatistics[i].valor;
			}
			for (let i = 0; i < this.variables.length; i++) {
				variables[this.variables[i].feature] = Object.values(this.variables[i])[1];
			}
			jsonData['statistics'] = statistics;
			jsonData['variables'] = variables;
			jsonData['idPrediccion'] = this.idPrediccion;
			fetch(window.location.origin + "/report/download?nCluster=" + this.nCluster, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(jsonData)
			})
				.then(response => response.blob())
				.then(blob => {
					const url = URL.createObjectURL(blob);
					const element = document.createElement('a');
					element.href = url;
					element.download = 'reporte.pdf';
					element.click();
					URL.revokeObjectURL(url);
				})
				.catch(error => console.error(error));
		},

		addPacienteBBDD: function() {
			const THIZ = this;
			THIZ.error2 = '';
			let jsonData = {};
			let variables = [];

			for (let i = 0; i < this.herramientaPredictivaInputs.length; i++) {
				variables.push(this.herramientaPredictivaInputs[i].seleccion);
			}
			jsonData['variables'] = variables;
			jsonData['variableObjetivo'] = this.variableObjetivo;
			fetch(window.location.origin + "/medico/addPacienteBBDD?idPrediccion=" + this.idPrediccion, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(jsonData)
			})
				.then(async res => {
					if (!res.ok) {
						const errorMessage = await res.text();
						THIZ.error2 = errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error en la respuesta del servidor: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					else{
						this.esconderModal();
					}
					return res.text();
				})
				.catch(error => console.error(error));
		},



		mostrarModal() {

			const THIZ = this;
			THIZ.variableObjetivo = '';
			let modal = new bootstrap.Modal(document.getElementById('addPacienteModal'));

			THIZ.addPacienteModal = modal;

			THIZ.addPacienteModal.show();

		},
		esconderModal() {

			const THIZ = this;
			THIZ.error2 = '';

			THIZ.addPacienteModal.hide();

		},


	},


	template: `
	<div class="container mb-5 mt-5">
		<span>
			<div id="cargando" v-show="mostrarCargando" style="position:fixed; display:none; width: 100%; height: 100%; margin:0; padding:0; top:0; left:0; background:rgba(255,255,255,0.75);">
        		<img id="cargando" src="/images/cargando.gif" style="top:50%; left:50%; position: fixed; transform: translate(-50%, -50%);"/>
   			 </div>
		</span>
		<div>
			<div class="row col-md-6 offset-md-3 mt-5 mb-5">
				<div v-if="error0 != ''" class="alert alert-danger">
					{{this.error0}}
				</div>
				<div class="card rounded-4 p-0 shadow">
					<div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
						<h2 class="text-center text-white">Elegir predicción</h2>
					</div>
					<div v-if="descripciones.length > 0" class="card-body">
						<form @submit.prevent="getPrediccionValues">	
							<div class="form-group mb-3">	       
								<div class="input-container">          
		                    		<label for="predicciones" class="input-container-label fw-bold">Predicciones</label>
									<select class="input-container-select" id="predicciones" name="predicciones" v-model="descripcionSeleccionada" required>
			                       		<option class="input-container-select-option" v-for="i in descripciones" :value="i">{{i}}</option>
			                    	</select>
		                    	</div>
		                    </div>
													
							<div class="form-group mb-2">
								<div class="row justify-content-center">
									<div class="col text-center">
										<button class="btn btn-outline-custom-color fs-5 fw-semibold"
											type="submit">Continuar</button>
									</div>
								</div>
							</div>
						</form>
					</div>
					<div v-else class="card-body">
						<p class="mt-3 text-center  text-custom-color fs-5 fw-bold">No hay predicciones disponibles</p>
					</div>
				</div>
			</div>
			
			
			
			<div v-if="isPrediccionSelected && error0 == ''" class="row col-md-6 offset-md-3 mt-5 mb-5">
				<div v-if="error1 != ''" class="alert alert-danger">
					{{this.error1}}
				</div>
				<div class="card rounded-4 p-0 shadow">
					<div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
						<h2 class="text-center text-white">Herramienta predictiva</h2>
					</div>
					<div class="card-body">
						<form @submit.prevent="getNewPatientClassification">
						
							<div class="form-group mb-3" v-for="i in this.herramientaPredictivaInputs">
								<div class="input-container">
									<label class="input-container-label fw-bold">{{i.nombre}}</label>
									<select class="input-container-select" name="herramientaPredictivaInputs" v-model="i.seleccion" required>
										<option class="input-container-select-option" value="" disabled selected></option>
										<option class="input-container-select-option" v-for="variable in i.variables" :value="variable">{{variable}}</option>
									</select>
								</div>
							</div>
							
							
							<div class="form-group mb-2">
								<div class="row justify-content-center">
									<div class="col text-center">
										<button class="btn btn-outline-custom-color fs-5 fw-semibold"
											type="submit">Calcular</button>
									</div>
								</div>
							</div>
							
						</form>
					</div>
				</div>
			</div>
		</div>
	
		<div v-if="datosCargados" class="row justify-content-around">
			<div class="mb-2" style="text-align: center">
				<h4 class="text-black">Cluster {{nCluster}} &nbsp  
					<button class="btn btn-outline-custom-color fs-5 fw-semibold" @click="descargarPdf">
						<i class="fa-regular fa-file-pdf"></i>
					</button>
					<button class="btn btn-outline-custom-color fs-5 fw-semibold" @click="mostrarModal">
						Añadir paciente
					</button>
					<div class="modal fade" id="addPacienteModal" tabindex="-1"
						aria-labelledby="addPacienteModalLabel" aria-hidden="true">
						<div class="modal-dialog modal-dialog-centered">
							<div class="modal-content">
								<div class="modal-header bg-custom-light-color">
									<h1 class="modal-title fs-5 text-white" id="addPacienteModelLabel">Nuevo paciente</h1>
									<button type="button" class="btn-close bg-white" style="font-size: 15px !important;"
										@click="esconderModal"></button>
								</div>
								<div class="modal-body">
									<div v-if="this.error2 != ''" class="alert alert-danger fs-6">
										{{this.error2}}
									</div>
									<form @submit.prevent="addPacienteBBDD">
										<div class="form-group mb-4">
											<div class="input-container mt-2">
												<label for="addPaciente"
													class="input-container-label fw-bold">Variable objetivo</label>
												<input class="input-container-input" style="padding-right: 3px;"
													min=1
													v-model="variableObjetivo" type="number" 
													id="addPaciente" required />
											</div>
										</div>
				
										<div class="form-group">
											<div class="row justify-content-center">
												<div class="col text-center">
													<button class="btn btn-outline-custom-color fs-5" type="submit">Guardar</button>
												</div>
											</div>
										</div>
									</form>
								</div>
							</div>
						</div>
					</div>
				</h4>
	        </div>
	        <div class="card col-5 rounded-4 p-0 mb-2 shadow">
	            <div v-if="curvaCargada" class="card-body">
	                <p><em>¡Imagen cargada correctamente! Haz clic sobre ella para descargarla</em></p>
	                <a v-bind:href="curvaUrl" :download="nombreDescargaCurvas">
	                    <img id="curvaUrl" v-bind:src="curvaUrl" style="max-width: 100%;"/>    
	                </a>
	            </div>	  
	            <div v-else class="card-body">
	                <p><em>No se pudo cargar la imagen</em></p>  
	            </div>	
	        </div>
	        <div class="card col-5 rounded-4 p-0 mb-2 shadow">
	            <div class="card-body">
	                <h2>Overview</h2>
	                <overview :statistics="this.datasetStatistics"/>
	            </div>
	        </div> 
	    </div>
	    
		 <div v-if="datosCargados" class="row justify-content-around">
	        <div class="col-5 mb-2"/>
	        <div class="card col-5 rounded-4 p-0 mb-2 shadow">
	            <div class="card-body">
	                <h2>Variables</h2>
	                <div class="col-md-6">
	                    <select class="form-select col-md-4" name="variables" v-model="variableSeleccionada">
	                        <option value="" disabled selected>Selecciona variable</option>
	                        <option v-for="variable in variables" :value="variable">{{variable.feature}}</option>
	                    </select>
	                </div>
	                <variables :variable="this.variableSeleccionada"/>
	            </div>
	        </div>
	    </div>
		
	</div>
	`
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


