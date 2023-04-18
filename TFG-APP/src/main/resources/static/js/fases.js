Vue.component('fase1', {
	data: function() {
		return {
			nClusters: '',
			csvFile: '',
			imagenCreada: false,
			imagenUrl: ''
		}
	},

	methods: {

		getOptimalNClusters() {
			const THIZ = this;
			const formData = new FormData();
			$('#cargando').show();
			formData.append('max_clusters', this.nClusters);
			formData.append('file', this.$refs.csvFile.files[0]);

			fetch(window.location.origin + "/admin/fases/getNClusters", {
				method: "POST",
				body: formData
			})
				.then(res => res.arrayBuffer())
				.then(image_bytes => {

					const byteArray = new Uint8Array(image_bytes);
					const blob = new Blob([byteArray], { type: 'image/png' });
					const url = URL.createObjectURL(blob);
					THIZ.imagenCreada = true;
					THIZ.imagenUrl = url;
					$('#cargando').hide();
				})
				.catch(error => console.error(error));
		}
	},


	template: `
	<div class="container col-md-12">
		<span>
			<div id="cargando" style="position:fixed; display:none; width: 100%; height: 100%; margin:0; padding:0; top:0; left:0; background:rgba(255,255,255,0.75);">
        		<img id="cargando" src="/images/cargando.gif" style="top:50%; left:50%; position: fixed; transform: translate(-50%, -50%);"/>
   			 </div>
		</span>
		
		<div class="col-md-6 p-2 m-3" style="border:1px solid black; border-radius:10px; padding:20px">
			<form @submit.prevent="getOptimalNClusters">				
				<div class="form-group col-md-4 pb-4">
					<label class="form-label" for="nClusters">Numero de clusters</label>
				    <input type="number" min=0 max=8 class="form-control" v-model="nClusters" id="nClusters">
				</div>
				
				<div class="form-group col-md-6 pb-4">
					<input type="file" accept=".csv" class="form-control-file" id="csv" ref="csvFile">
				</div>
				
				<button type="submit" class="btn btn-primary">Ejecutar</button>
			</form>
		</div>
		
		<div v-if="imagenCreada" class="col-md-10 p-2 m-3">
			<p><em>¡Imagen creada correctamente! Haz clic sobre ella para descargarla</em></p>
			<a v-bind:href="imagenUrl" download="nClustersImagen.png">
				<img id="imagenFase1" v-bind:src="imagenUrl" style="max-width:100%"/>
			</a>
		</div>
	</div>
	`
});

Vue.component('fase2', {
	data: function() {
		return {
			nClustersAglomerativo: '',
			nClustersKModes: '',
			csvFile: ''
		}
	},

	methods: {

		getSubPopulations() {
			const THIZ = this;
			const formData = new FormData();
			$('#cargando').show();
			formData.append('nClustersAglomerativo', this.nClustersAglomerativo);
			formData.append('nClustersKModes', this.nClustersKModes);
			formData.append('file', this.$refs.csvFile.files[0]);

			fetch(window.location.origin + "/admin/fases/getSubPopulations", {
				method: "POST",
				headers: {
					"Accept": "text/csv"
				},
				body: formData
			})
				.then(response => {
					// Verificar si la respuesta es OK
					if (!response.ok) {
						throw new Error('Ocurrió un error al descargar el archivo');
					}

					// Crear un objeto URL para el contenido del archivo
					return response.arrayBuffer();
				})
				.then(csv_bytes => {

					const byteArray = new Uint8Array(csv_bytes);
					const blob = new Blob([byteArray], { type: 'text/csv' });
					const url = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.href = url;
					link.download = 'SubPopulationsResponse.csv';

					// Agregar el enlace al DOM y hacer clic en él para descargar el archivo
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					$('#cargando').hide();
				})
				.catch(error => console.error(error));
		}
	},



	template: `
	<div class="container col-md-12">
		<span>
			<div id="cargando" style="position:fixed; display:none; width: 100%; height: 100%; margin:0; padding:0; top:0; left:0; background:rgba(255,255,255,0.75);">
        		<img id="cargando" src="/images/cargando.gif" style="top:50%; left:50%; position: fixed; transform: translate(-50%, -50%);"/>
   			 </div>
		</span>
		
		<div class="col-md-6 p-2 m-3" style="border:1px solid black; border-radius:10px; padding:20px">
			<form @submit.prevent="getSubPopulations">				
				<div class="form-group col-md-4 pb-4">
					<label class="form-label" for="nClusters">Numero de clusters del algoritmo aglomerativo</label>
				    <input type="number" min=0 max=4 class="form-control" v-model="nClustersAglomerativo" id="nClustersAglomerativo">
				</div>
				
				<div class="form-group col-md-4 pb-4">
					<label class="form-label" for="nClusters">Numero de clusters del algoritmo kmodes</label>
				    <input type="number" min=0 max=4 class="form-control" v-model="nClustersKModes" id="nClustersKModes">
				</div>
				
				<div class="form-group col-md-6 pb-4">
					<input type="file" accept=".csv" class="form-control-file" id="csv" ref="csvFile">
				</div>
				
				<button type="submit" class="btn btn-primary">Calcular clusters</button>
			</form>
		</div>
	</div>
	`
});

Vue.component('fase3', {
	data: function() {
		return {
			lista: [],
			headers: [{ header: "Metric", pos: 0 }, { header: "Tss_value", pos: 1 }, { header: "Total_wc", pos: 2 }, { header: "Total_bc", pos: 3 }],
			datosCargados: false
		}
	},

	methods: {
		getVarianceMetrics: function() {
			const THIZ = this;
			const formData = new FormData();
			$('#cargando').show();
			formData.append('file', this.$refs.csvFile.files[0]);

			fetch(window.location.origin + "/admin/fases/getVarianceMetrics", {
				method: "POST",
				body: formData
			})
				.then(response => response.json())
				.then(data => {
					for (i = 0, j = 1; j < data.length; i++, j++) THIZ.lista[i] = data[j]
					THIZ.datosCargados = true;
					$('#cargando').hide();
				})
				.catch(error => console.error(error));

		}
	},

	template: `
	<div class="container col-md-12">
		<span>
			<div id="cargando" style="position:fixed; display:none; width: 100%; height: 100%; margin:0; padding:0; top:0; left:0; background:rgba(255,255,255,0.75);">
        		<img id="cargando" src="/images/cargando.gif" style="top:50%; left:50%; position: fixed; transform: translate(-50%, -50%);"/>
   			 </div>
		</span>
	
		<div class="col-md-6 p-2 m-3" style="border:1px solid black; border-radius:10px; padding:20px">
			<form @submit.prevent="getVarianceMetrics">						
				<div class="form-group col-md-6 pb-4">
					<input type="file" accept=".csv" class="form-control-file" id="csv" ref="csvFile">
				</div>	
				
				<button type="submit" class="btn btn-primary">Ejecutar</button>
			</form>
		</div>
		
		<table v-if="datosCargados" class="table table-bordered table-hover p-2 m-3">
			<thead class="table-dark">
				<tr>
					<th v-for="head in headers"> 
					{{head.header}}
					</th>
				</tr>
			</thead>
			
			<tbody>
				<tr v-for="i in lista">
					<td>{{i.metric}}</td>
					<td>{{i.tss_value}}</td>
					<td>{{i.total_wc}}</td>
					<td>{{i.total_bc}}</td>
				</tr>
			</tbody>
		</table>	
	</div>
	`
});




Vue.component('fase4', {
	data: function() {
		return {
			csvFile: '',
			csvFile2: '',
			imagenCreada: false,
			imagenUrl: '',
			datosCargados: false,
			datasetStatistics: [
				{ nombre: 'Id Prediction', fila: 0, valor: '' },
				{ nombre: 'Number of variables', fila: 1, valor: '' },
				{ nombre: 'Number of observations', fila: 2, valor: '' },
				{ nombre: 'Target median', fila: 3, valor: '' },
				{ nombre: 'Target third quantile', fila: 4, valor: '' },
			],
			variableSeleccionada: '',
			variables: [{ feature: 'agglomerative', agglomerative: [] }, { feature: 'GENDER', GENDER: [] }, { feature: 'EDUCATION', EDUCATION: [] }, { feature: 'ETHCAT', ETHCAT: [] },
			{ feature: 'WORK_INCOME_TCR', WORK_INCOME_TCR: [] }, { feature: 'PRI_PAYMENT_TCR_KI', PRI_PAYMENT_TCR_KI: [] }, { feature: 'AGE_RANGE', AGE_RANGE: [] }],
		}
	},

	methods: {
		createAllSurvivalCurves: function() {
			const THIZ = this;
			THIZ.imagenCreada = false;
			const formData = new FormData();
			$('#cargando').show();
			formData.append('file', this.$refs.csvFile.files[0]);

			fetch(window.location.origin + "/admin/fases/createAllSurvivalCurves", {
				method: "POST",
				body: formData
			})
				.then(res => res.arrayBuffer())
				.then(image_bytes => {

					THIZ.divJson = false;
					const byteArray = new Uint8Array(image_bytes);
					const blob = new Blob([byteArray], { type: 'image/png' });
					const url = URL.createObjectURL(blob);
					THIZ.imagenCreada = true;
					THIZ.imagenUrl = url;
					$('#cargando').hide();
				})
				.catch(error => console.error(error));


		},

		createPopulationProfile: function() {
			const THIZ = this;
			const formData = new FormData();
			this.datosCargados = false;
			this.variableSeleccionada = '';
			$('#cargando').show();

			formData.append('file', this.$refs.csvFile2.files[0]);

			fetch(window.location.origin + "/admin/fases/createPopulationProfile", {
				method: "POST",
				body: formData
			})
				.then(res => res.json())
				.then(data => {

					THIZ.datasetStatistics[0].valor = data.id_prediction;
					THIZ.datasetStatistics[1].valor = data.number_of_variables;
					THIZ.datasetStatistics[2].valor = data.number_of_observations;
					THIZ.datasetStatistics[3].valor = data.target_median;
					THIZ.datasetStatistics[4].valor = data.target_third_quantile;

					for (i = 0; i < data.features.length; i++) {
						THIZ.variables[i] = data.features[i];
					}

					THIZ.datosCargados = true;

					$('#cargando').hide();
				})
				.catch(error => console.error(error));


		}
	},
	template: `
	<div class="container">
		<span>
			<div id="cargando" style="position:fixed; display:none; width: 100%; height: 100%; margin:0; padding:0; top:0; left:0; background:rgba(255,255,255,0.75);">
        		<img id="cargando" src="/images/cargando.gif" style="top:50%; left:50%; position: fixed; transform: translate(-50%, -50%);"/>
   			 </div>
		</span>
		
		<div class="row">
			<div class="col-md-5 p-2 mt-3 m-1" style="border:1px solid black; border-radius:10px">
				<h4>Create all survival curves</h4>
				<form @submit.prevent="createAllSurvivalCurves">				
					<div class="form-group col-md-6 pb-4">
						<input type="file" accept=".csv" class="form-control-file" id="csv1" ref="csvFile">
					</div>
					
					<button type="submit" class="btn btn-primary">Ejecutar</button>
				</form>
			</div>
			
			<div class="col-md-5 p-2 mt-3 m-1" style="border:1px solid black; border-radius:10px">
				<h4>Create population profile</h4>
				<form @submit.prevent="createPopulationProfile">				
					<div class="form-group col-md-6 pb-4">
						<input type="file" accept=".csv" class="form-control-file" id="csv2" ref="csvFile2">
					</div>
					
					<button type="submit" class="btn btn-primary">Ejecutar</button>
				</form>
			</div>
		</div>
		
		<div class="row">
			<div v-if="imagenCreada" class="col-md-5 p-2 m-1" style="border:1px solid black; border-radius:10px;">
				<p><em>¡Imagen creada correctamente! Haz clic sobre ella para descargarla</em></p>
				<a v-bind:href="imagenUrl" download="survivalCurves.png">
					<img id="imagenFase4" v-bind:src="imagenUrl" style="max-width:100%"/>
				</a>
			</div>
			<div v-else class="col-md-5 p-2 m-1"/>
		
			<div v-if="datosCargados" class="col-md-5 p-2 m-1" style="border:1px solid black; border-radius:10px;">
				<h2>Overview</h2>
				<overview :statistics="this.datasetStatistics"/>
			</div>
		</div>
		
		<div class="row">
			<div class="col-md-5 p2 m-1"/>
			<div v-if="datosCargados" class="col-md-5 p-2 m-1" style="border:1px solid black; border-radius:10px;">
				<h2>Variables</h2>
				<select name="variables" v-model="variableSeleccionada">
					<option value="" disabled selected>Select columns</option>
					<option v-for="variable in variables" :value="variable">{{variable.feature}}</option>
				</select>
				
				<variables :variable="this.variableSeleccionada"/>	
	    	</div>
	 	</div>				
	</div>
	`
});



Vue.component('fase5', {
	data: function() {
		return {
			clusterNumberSurvivalCurve: '',
			csvFileSurvivalCurve: '',
			imagenCreada: false,
			imagenUrl: '',
			clusterNumberProfile: '',
			csvFileProfile: '',
			datasetStatistics: [
				{ nombre: 'Id Prediction', fila: 0, valor: '' },
				{ nombre: 'Number of variables', fila: 1, valor: '' },
				{ nombre: 'Number of observations', fila: 2, valor: '' },
				{ nombre: 'Target median', fila: 3, valor: '' },
				{ nombre: 'Target third quantile', fila: 4, valor: '' },
			],
			variables: [{ feature: 'GENDER', GENDER: [] }, { feature: 'EDUCATION', EDUCATION: [] }, { feature: 'ETHCAT', ETHCAT: [] },
			{ feature: 'WORK_INCOME_TCR', WORK_INCOME_TCR: [] }, { feature: 'PRI_PAYMENT_TCR_KI', PRI_PAYMENT_TCR_KI: [] }, { feature: 'AGE_RANGE', AGE_RANGE: [] }],
			variableSeleccionada: '',
			datosCargados: false,

		}
	},


	methods: {
		createClusterSurvivalCurve() {
			const THIZ = this;
			const formData = new FormData();
			this.imagenCreada = false;
			$('#cargando').show();
			formData.append('cluster_number', this.clusterNumberSurvivalCurve);
			formData.append('file', this.$refs.csvFileSurvivalCurve.files[0]);

			fetch(window.location.origin + "/admin/fases/createClusterSurvivalCurve", {
				method: "POST",
				body: formData
			})
				.then(res => res.arrayBuffer())
				.then(image_bytes => {

					const byteArray = new Uint8Array(image_bytes);
					const blob = new Blob([byteArray], { type: 'image/png' });
					const url = URL.createObjectURL(blob);
					THIZ.imagenCreada = true;
					THIZ.imagenUrl = url;
					$('#cargando').hide();
				})
				.catch(error => console.error(error));
		},

		createClusterProfile() {
			const THIZ = this;
			this.datosCargados = false;
			this.variableSeleccionada = '';
			const formData = new FormData();
			$('#cargando').show();
			formData.append('cluster_number', this.clusterNumberProfile);
			formData.append('file', this.$refs.csvFileProfile.files[0]);

			fetch(window.location.origin + "/admin/fases/createClusterProfile", {
				method: "POST",
				body: formData
			})
				.then(response => response.json())
				.then(data => {
					THIZ.datasetStatistics[0].valor = data.id_prediction;
					THIZ.datasetStatistics[1].valor = data.number_of_variables;
					THIZ.datasetStatistics[2].valor = data.number_of_observations;
					THIZ.datasetStatistics[3].valor = data.target_median;
					THIZ.datasetStatistics[4].valor = data.target_third_quantile;

					for (i = 0; i < data.features.length; i++) {
						THIZ.variables[i] = data.features[i];
					}
					THIZ.datosCargados = true;
					$('#cargando').hide();
				})
				.catch(error => console.error(error));
		},

	},


	template: `
	
	<div class="container">
		<span>
			<div id="cargando" style="position:fixed; display:none; width: 100%; height: 100%; margin:0; padding:0; top:0; left:0; background:rgba(255,255,255,0.75);">
        		<img id="cargando" src="/images/cargando.gif" style="top:50%; left:50%; position: fixed; transform: translate(-50%, -50%);"/>
   			 </div>
		</span>
		
		<div class="row">
			<div class="col-md-5 p-2 mt-3 m-1" style="border:1px solid black; border-radius:10px">
				<h4>Create cluster survival curve</h4>
				<form @submit.prevent="createClusterSurvivalCurve">				
					<div class="form-group col-md-4 pb-4">
						<label class="form-label" for="clusterNumberSurvivalCurve">Numero de cluster</label>
					    <input type="number" min=0 class="form-control" v-model="clusterNumberSurvivalCurve" id="clusterNumberSurvivalCurve">
					</div>
					
					<div class="form-group col-md-6 pb-4">
						<input type="file" accept=".csv" class="form-control-file" id="csv" ref="csvFileSurvivalCurve">
					</div>
					
					<button type="submit" class="btn btn-primary">Ejecutar</button>
				</form>
			</div>
			
			<div class="col-md-5 p-2 mt-3 m-1" style="border:1px solid black; border-radius:10px">
				<h4>Create cluster profile</h4>
				<form @submit.prevent="createClusterProfile">				
					<div class="form-group col-md-4 pb-4">
						<label class="form-label" for="clusterNumberProfile">Numero de cluster</label>
					    <input type="number" min=0 class="form-control" v-model="clusterNumberProfile" id="clusterNumberProfile">
					</div>
					
					<div class="form-group col-md-6 pb-4">
						<input type="file" accept=".csv" class="form-control-file" id="csv" ref="csvFileProfile">
					</div>
					
					<button type="submit" class="btn btn-primary">Ejecutar</button>
				</form>
			</div>
		</div>
		
		<div class="row">	
			<div v-if="imagenCreada" class="col-md-5 p-2 m-1" style="border:1px solid black; border-radius:10px;">
				<p><em>¡Imagen creada correctamente! Haz clic sobre ella para descargarla</em></p>
				<a v-bind:href="imagenUrl" download="nClustersImagen.png">
					<img id="imagenFase5" v-bind:src="imagenUrl" style="max-width:100%"/>
				</a>
			</div>
			<div v-else class="col-md-5 p-2 m-1"/>
			<div v-if="datosCargados" class="col-md-5 p-2 m-1" style="border:1px solid black; border-radius:10px;">
				<h2>Overview</h2>
				<overview :statistics="this.datasetStatistics"/>
			</div>
		</div>
		
		<div class="row">
			<div class="col-md-5 p2 m-1"/>
			<div v-if="datosCargados" class="col-md-5 p-2 m-1" style="border:1px solid black; border-radius:10px;">
				<h2>Variables</h2>
				<select name="variables" v-model="variableSeleccionada">
					<option value="" disabled selected>Select columns</option>
					<option v-for="variable in variables" :value="variable">{{variable.feature}}</option>
				</select>
				
				<variables :variable="this.variableSeleccionada"/>	
	    	</div>
 		</div>	
	</div>	
	`
});

Vue.component('fase6', {
	data: function() {
		return {
			csvGetPerformanceModel: ''
		}
	},


	methods: {

		getModelPerformance() {
			const THIZ = this;
			const formData = new FormData();
			$('#cargando').show();
			formData.append('file', this.$refs.csvGetPerformanceModel.files[0]);

			fetch(window.location.origin + "/admin/fases/getModelPerformance", {
				method: "POST",
				body: formData
			})
				.then(response => response.json())
				.then(data => {
					
					console.log(data);
		
					$('#cargando').hide();
				})
				.catch(error => console.error(error));
		}
	},


	template: `
	
	<div class="container">
		<span>
			<div id="cargando" style="position:fixed; display:none; width: 100%; height: 100%; margin:0; padding:0; top:0; left:0; background:rgba(255,255,255,0.75);">
        		<img id="cargando" src="/images/cargando.gif" style="top:50%; left:50%; position: fixed; transform: translate(-50%, -50%);"/>
   			 </div>
		</span>
		
		<div class="row">
			<div class="col-md-5 p-2 mt-3 m-1" style="border:1px solid black; border-radius:10px">
				<h4>Get Model Performance</h4>
				<form @submit.prevent="getModelPerformance">				
					
					<div class="form-group col-md-6 pb-4">
						<input type="file" accept=".csv" class="form-control-file" id="csv" ref="csvGetPerformanceModel">
					</div>
					
					<button type="submit" class="btn btn-primary">Ejecutar</button>
				</form>
			</div>
			
		</div>
		
	</div>	
	`
});

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


new Vue({
	el: "#fases",
	data: function() {
		return {
			seleccion: '',
		}
	},

	methods: {
		cambiarSeleccion(seleccion) {
			const THIZ = this;
			THIZ.seleccion = seleccion;
		},

		colorTexto(seleccion) {
			if (seleccion === this.seleccion) return 'white';
			else return 'black';
		},

		colorBoton(seleccion) {
			if (seleccion === this.seleccion) return '#0D6EFD';
			else return '#AACDFF'
		},

		linea(seleccion) {
			if (seleccion === this.seleccion) return '1.5px solid';
			else return '1px solid';
		},
	},


	template: `
	<div class="container pt-2">		
	    <div class="row col-md-10">
			<h2>Fases</h2>
		</div>
    	<div class="col-md-12">
            <button @click="cambiarSeleccion('Fase1')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase1'), border: linea('Fase1')}">
                <span :style="{color: colorTexto('Fase1')}">Obtener nº optimo clusters</span> 
            </button>
            <button @click="cambiarSeleccion('Fase2')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase2'), border: linea('Fase2')}">
                <span :style="{color: colorTexto('Fase2')}">Obtener subpoblaciones</span>
            </button>
            <button @click="cambiarSeleccion('Fase3')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase3'), border: linea('Fase3')}">
                <span :style="{color: colorTexto('Fase3')}">Obtener métricas de varianza</span>
            </button>
            <button @click="cambiarSeleccion('Fase4')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase4'), border: linea('Fase4')}">
                <span :style="{color: colorTexto('Fase4')}">Obtener gráficas y variables de poblacion</span>
            </button>
            <button @click="cambiarSeleccion('Fase5')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase5'), border: linea('Fase5')}">
                <span :style="{color: colorTexto('Fase5')}">Obtener gráficas y variables por cluster</span>
            </button>
            <button @click="cambiarSeleccion('Fase6')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase5'), border: linea('Fase5')}">
                <span :style="{color: colorTexto('Fase6')}">Obtener rendimiento del modelo</span>
            </button>
    	</div>	    
    	
    	<fase1 v-if="seleccion==='Fase1'"/>
    	<fase2 v-if="seleccion==='Fase2'"/>
        <fase3 v-if="seleccion==='Fase3'"/>     
        <fase4 v-if="seleccion==='Fase4'"/>  
        <fase5 v-if="seleccion==='Fase5'"/>   
        <fase6 v-if="seleccion==='Fase6'"/>
	</div>
	`
})