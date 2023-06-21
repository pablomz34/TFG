Vue.component('fase1', {
	props: ['idPrediccionPoblacion', 'csvInput'],
	data: function() {
		return {
			nClusters: '',
			csvFile: '',
			imagenCreada: false,
			imagenUrl: '',
			error: '',
			mostrarCargando: false,
		}
	},
	methods: {

		getOptimalNClusters() {
			const THIZ = this;

			const formData = new FormData();
			THIZ.mostrarCargando = true;

			formData.append('max_clusters', this.nClusters);

			if (THIZ.csvInput) {
				formData.append('file', this.$refs.csvFile.files[0]);
			}
			else {
				formData.append('idPrediccionPoblacion', THIZ.idPrediccionPoblacion);
			}


			THIZ.error = '';
			fetch(window.location.origin + "/admin/fases/getOptimalNClusters", {
				method: "POST",
				body: formData
			})
				.then(async res => {

					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error = "Error: " + errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.arrayBuffer();

				})
				.then(image_bytes => {

					const byteArray = new Uint8Array(image_bytes);
					const blob = new Blob([byteArray], { type: 'image/png' });
					const url = URL.createObjectURL(blob);
					THIZ.imagenCreada = true;
					THIZ.imagenUrl = url;
					THIZ.mostrarCargando = false;
				})
				//.catch(error => console.error(error))
				.catch(error => console.error(error))
		},

		cambiarFase() {
			this.$emit('cambiarFase');
		}
	},


	template: `
	<div class="container mb-5 mt-5">
		<span>
	        <div id="cargando" v-show="mostrarCargando" style="position: fixed; display: none; width: 100%; height: 100%; margin: 0; padding: 0; top: 0; left: 0; background: rgba(255, 255, 255, 0.75); z-index: 9999;">
	            <img id="cargando" src="/images/cargando.gif" style="top: 50%; left: 50%; position: fixed; transform: translate(-50%, -50%); z-index: 9999;"/>
	        </div>
	    </span>
	    <div class="row col-md-6 offset-md-3">
	        <div v-if="error != ''" class="alert alert-danger">
	            {{this.error}}
	        </div>
	        <div class="card rounded-4 p-0 mb-2 shadow">
	            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Nº Óptimo de Clusters</h2>
	            </div>
	            <div class="card-body">
	                <form @submit.prevent="getOptimalNClusters">
	                    <div class="form-group mb-3">
                    		<div class="input-container">
		                        <label class="input-container-label fw-bold" for="nClusters">Nº de clusters</label>
		                        <input type="number" min="2" max="20" class="input-container-input pe-1" v-model="nClusters" id="nClusters" required />
	                    	</div>
	                    </div>
	                    <div v-if="csvInput" class="form-group mb-3">
	                    	<div class="input-container">
		                        <label for="csv" class="input-container-input-file-label fw-bold">Archivo Csv</label>
		                        <input class="input-container-input-file" accept=".csv" type="file" id="csv" ref="csvFile" required />
	                   		</div>
	                    </div>
	                    <div class="form-group mb-2">
	                        <div class="row justify-content-center">
	                            <div class="col text-center">
	                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Ejecutar</button>
	                            </div>
	                        </div>
	                    </div>
	                </form>
	            </div>
	        </div>
	    </div>
	    <div class="row justify-content-around">
	        <div v-if="imagenCreada" class="card col-10 rounded-4 p-0 shadow">
	            <div class="card-body">
					<p><em>¡Imagen creada correctamente! Haz clic sobre ella para descargarla</em></p>
	                <a v-bind:href="imagenUrl" download="nClustersImagen.png">
	                    <img id="imagenFase1" v-bind:src="imagenUrl" style="max-width: 100%;"/>
	                </a>
	            </div>
	        </div>
	    </div>
	    <div class="row justify-content-center m-2">	
			<button type="button" @click="cambiarFase" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
		</div>
	</div>
	`
});

Vue.component('fase2', {
	props: ['idPrediccionPoblacion', 'csvInput'],
	data: function() {
		return {
			nClustersAglomerativo: '',
			nClustersKModes: '',
			csvFile: '',
			error: '',
			mostrarCargando: false
		}
	},

	methods: {

		getSubPopulations: function() {
			const THIZ = this;
			THIZ.mostrarCargando = true;
			THIZ.error = '';

			const formData = new FormData();




			formData.append('n_agglomerative', this.nClustersAglomerativo);
			formData.append('n_kmodes', this.nClustersKModes);


			if (THIZ.csvInput) {
				formData.append('file', this.$refs.csvFile.files[0]);
			}
			else {
				formData.append('idPrediccionPoblacion', THIZ.idPrediccionPoblacion);
			}

			fetch(window.location.origin + "/admin/fases/getSubPopulations", {
				method: "POST",
				headers: {
					"Accept": "text/csv"
				},
				body: formData
			})
				.then(async res => {
					// Verificar si la respuesta es OK
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error = "Error: " + errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					// Crear un objeto URL para el contenido del archivo
					return res.arrayBuffer();
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
					THIZ.mostrarCargando = false;

				})
				.catch(error => console.error(error));
		},
		cambiarFase() {
			this.$emit('cambiarFase');
		}
	},



	template: `
	<div class="container mb-5 mt-5">
	    <span>
	        <div id="cargando" v-show="mostrarCargando" style="position: fixed; display: none; width: 100%; height: 100%; margin: 0; padding: 0; top: 0; left: 0; background: rgba(255, 255, 255, 0.75); z-index: 9999;">
	            <img id="cargando" src="/images/cargando.gif" style="top: 50%; left: 50%; position: fixed; transform: translate(-50%, -50%); z-index: 9999;"/>
	        </div>
	    </span>
	
	    <div class="row col-md-6 offset-md-3">
	        <div v-if="error != ''" class="alert alert-danger">
	            {{this.error}}
	        </div>
	        <div class="card rounded-4 p-0 shadow">
	            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Subpoblaciones</h2>
	            </div>
	            <div class="card-body">
	                <form @submit.prevent="getSubPopulations">
	                    <div class="form-group mb-3">
	                    	<div class="input-container">
		                        <label class="input-container-label fw-bold" for="nClusters">Nº de clusters del algoritmo aglomerativo</label>
		                        <input type="number" min="1" max="8" class="input-container-input pe-1" v-model="nClustersAglomerativo" id="nClustersAglomerativo" required />
	                   		</div>
	                    </div>
	
	                    <div class="form-group mb-3">
	                    	<div class="input-container">
		                        <label class="input-container-label fw-bold" for="nClusters">Nº de clusters del algoritmo kmodes</label>
		                        <input type="number" min="1" max="8" class="input-container-input pe-1" v-model="nClustersKModes" id="nClustersKModes" required />
	                    	</div>
	                    </div>
	
	                    <div v-if="csvInput" class="form-group mb-3">
	                    	<div class="input-container">
		                        <label for="csv" class="input-container-input-file-label fw-bold">Archivo csv</label>
		                        <input class="input-container-input-file" accept=".csv" type="file" id="csv" ref="csvFile" required />
                   			</div>
	                    </div>
	
	                    <div class="form-group mb-2">
	                        <div class="row justify-content-center">
	                            <div class="col text-center">
	                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Ejecutar</button>
	                            </div>
	                        </div>
	                    </div>
	                </form>
	            </div>
	        </div>
	    </div>
	    <div class="row justify-content-center m-2">	
			<button type="button" @click="cambiarFase" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
		</div>
	</div>
	`
});

Vue.component('fase3', {
	props: ['idPrediccionPoblacion', 'csvInput'],
	data: function() {
		return {
			lista: [],
			headers: [{ header: "Metric", pos: 0 }, { header: "Tss_value", pos: 1 }, { header: "Total_wc", pos: 2 }, { header: "Total_bc", pos: 3 }],
			datosCargados: false,
			error: '',
			mostrarCargando: false,
			algoritmoOptimo: ''
		}
	},

	methods: {
		getVarianceMetrics: function() {
			const THIZ = this;
			THIZ.error = '';
			const formData = new FormData();
			THIZ.mostrarCargando = true;

			if (THIZ.csvInput) {
				formData.append('file', this.$refs.csvFile.files[0]);
			}
			else {
				formData.append('idPrediccionPoblacion', THIZ.idPrediccionPoblacion);
			}

			fetch(window.location.origin + "/admin/fases/getVarianceMetrics", {
				method: "POST",
				body: formData
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error = "Error: " + errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.json();

				})
				.then(data => {
					
					for (i = 0, j = 1; j < data.length; i++, j++) THIZ.lista[i] = data[j]
					
					let minimoWc = THIZ.lista[0].total_wc;
					
					let maximoBc = THIZ.lista[0].total_bc;
					
					let nombre_algoritmo = THIZ.lista[0].metric;
					
					for(let i=1; i < THIZ.lista.length; i++){
						
						if(THIZ.lista[i].total_wc <= minimoWc && THIZ.lista[i].total_bc >= maximoBc){
							minimoWc = THIZ.lista[i].total_wc;
							maximoBc = THIZ.lista[i].total_bc;
							nombre_algoritmo = THIZ.lista[i].metric;
						}
											
					}
					
					THIZ.algoritmoOptimo = nombre_algoritmo;				
					
					THIZ.datosCargados = true;
					THIZ.mostrarCargando = false;
				})
				.catch(error => console.error(error));

		},
		cambiarFase() {
			this.$emit('cambiarFase', this.algoritmoOptimo);
		}
	},

	template: `
	<div class="container mb-5 mt-5">
	    <span>
	        <div id="cargando" v-show="mostrarCargando" style="position: fixed; display: none; width: 100%; height: 100%; margin: 0; padding: 0; top: 0; left: 0; background: rgba(255, 255, 255, 0.75); z-index: 9999;">
	            <img id="cargando" src="/images/cargando.gif" style="top: 50%; left: 50%; position: fixed; transform: translate(-50%, -50%); z-index: 9999;"/>
	        </div>
	    </span>
	
	    <div class="row col-md-6 offset-md-3">
	        <div v-if="error != ''" class="alert alert-danger">
	            {{this.error}}
	        </div>
	        <div class="card rounded-4 p-0 shadow">
	            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Métricas de Varianza</h2>
	            </div>
	            <div class="card-body">
	                <form @submit.prevent="getVarianceMetrics">
	                    <div v-if="csvInput" class="form-group mb-3">
                    		<div class="input-container">
		                        <label for="csv" class="input-container-input-file-label fw-bold">Archivo csv</label>
		                        <input class="input-container-input-file" accept=".csv" type="file" id="csv" ref="csvFile" required />
	                    	</div>
	                    </div>
	
	                    <div class="form-group mb-2">
	                        <div class="row justify-content-center">
	                            <div class="col text-center">
	                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Ejecutar</button>
	                            </div>
	                        </div>
	                    </div>
	                </form>
	            </div>
	        </div>
	    </div>
	
	    <div v-if="datosCargados" class="table-responsive shadow-lg p-0 mt-4">
	        <table class="table table-custom-color table-striped-columns table-hover shadow-lg m-0">
	            <thead class="table-custom-color-table-head">
	                <tr>
	                    <th v-for="head in headers" class="fs-5 text-white">
	                        {{head.header}}
	                    </th>
	                </tr>
	            </thead>
	
	            <tbody>
	                <tr v-for="i in lista">
	                    <td class="fw-semibold text-light">{{i.metric}}</td>
	                    <td class="fw-semibold text-light">{{i.tss_value}}</td>
	                    <td class="fw-semibold text-light">{{i.total_wc}}</td>
	                    <td class="fw-semibold text-light">{{i.total_bc}}</td>
	                </tr>
	            </tbody>
	        </table>
	    </div>
	    <div class="row justify-content-center m-2">	
			<button type="button" @click="cambiarFase" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
		</div>
	</div>
	`
});




Vue.component('fase4', {
	props: ['idPrediccionPoblacion', 'csvInput', 'algoritmoOptimo'],
	data: function() {
		return {
			crear: true,
			descripcionSeleccionada: '',
			descripciones: [],
			continuar: false,
			csvFile: '',
			curvasAndPerfilesCreados: false,
			idPrediccion: '',
			nClusters: '',
			clusterSeleccionadoCurves: '',
			clusterSeleccionadoProfile: '',
			curvasUrl: '',
			nombreDescargaCurvas: '',
			curvasCargadas: false,
			perfilCargado: false,
			datasetStatistics: [
				{ nombre: 'Id Prediction', valor: '' },
				{ nombre: 'Number of variables', valor: '' },
				{ nombre: 'Number of observations', valor: '' },
				{ nombre: 'Target median', valor: '' },
				{ nombre: 'Target third quantile', valor: '' },
			],
			variableSeleccionada: '',
			variables: [],
			error0: '',
			error1: '',
			error2: '',
			error3: '',
			mostrarCargando: false,
		}
	},

	created() {
		
		this.getDescripciones();
	},

	watch: {
		descripcionSeleccionada() {
			const THIZ = this;
			THIZ.continuar = false;
		}
	},

	computed: {
		nClustersRange() {
			return Array.from({ length: this.nClusters }, (_, index) => index);
		}
	},

	methods: {

		getDescripciones: function() {
			const THIZ = this;
			fetch(window.location.origin + "/admin/fases/getDescripcionesPredicciones", {
				method: "GET",
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						//THIZ.error1 = "Error: " + errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.json();

				})
				.then(data => {

					for (i = 0; i < data.length; i++) {
						THIZ.descripciones.push(data[i]);
					}
					THIZ.mostrarCargando = false;
				})
				.catch(error => console.error(error));
		},

		seleccionarPrediccion: function() {
			const THIZ = this;
			THIZ.mostrarCargando = true;
			THIZ.error0 = '';
			fetch(window.location.origin + "/admin/fases/createOrUpdatePrediction?crearPrediccion=" + this.crear +
				"&descripcion=" + this.descripcionSeleccionada, {
				method: "POST",
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error0 = "Error: " + errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.text();
				})
				.then(data => {
					THIZ.idPrediccion = data;
					if (this.crear) THIZ.descripciones.push(this.descripcionSeleccionada);
					THIZ.continuar = true;
					THIZ.mostrarCargando = false;
				})
				.catch(error => console.error(error));
		},

		createPopulationAndCurves: function() {
			const THIZ = this;
			THIZ.curvasCargadas = false;
			THIZ.perfilCargado = false;
			THIZ.error1 = '';
			THIZ.curvasAndPerfilesCreados = false;
			const formData = new FormData();
			THIZ.mostrarCargando = true;

			if (THIZ.csvInput) {
				formData.append('idPrediccionPoblacion', THIZ.idPrediccion);
				formData.append('file', this.$refs.csvFile.files[0]);

			}
			else {
				formData.append('idPrediccionPoblacion', THIZ.idPrediccionPoblacion);
				formData.append('algoritmoOptimo', THIZ.algoritmoOptimo);
			}


			fetch(window.location.origin + "/admin/fases/createPopulationAndCurves", {
				method: "POST",
				body: formData
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error1 = "Error: " + errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.text();

				})
				.then(data => {

					THIZ.nClusters = data;
					THIZ.curvasAndPerfilesCreados = true;
					THIZ.mostrarCargando = false;
				})
				.catch(error => console.error(error));


		},

		mostrarClusterSurvivalCurve: function() {
			const THIZ = this;
			THIZ.mostrarCargando = true;
			THIZ.curvasCargadas = false;

			THIZ.error2 = '';

			let prediccionIdUrl = "";
			if (THIZ.idPrediccionPoblacion.length !== 0) {
				prediccionIdUrl += THIZ.idPrediccionPoblacion;
			}
			else if (THIZ.idPrediccion.length !== 0) {
				prediccionIdUrl += THIZ.idPrediccion;
			}


			fetch(window.location.origin + "/admin/fases/getRutaCluster?clusterNumber=" + this.clusterSeleccionadoCurves + "&idPrediccion=" + prediccionIdUrl, {
				method: "GET",
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error2 = "Error: " + errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.text();
				})
				.then(data => {
					THIZ.curvasUrl = data;
					THIZ.nombreDescargaCurvas = 'prediccion' + this.idPrediccion + 'cluster' + this.clusterSeleccionadoCurves + '.png';
					THIZ.curvasCargadas = true;
					THIZ.mostrarCargando = false;
				})
				.catch(error => console.error(error));
		},

		mostrarClusterProfile: function() {
			const THIZ = this;
			THIZ.mostrarCargando = true;

			THIZ.error3 = '';
			THIZ.perfilCargado = false;

			let prediccionIdUrl = "";
			if (THIZ.csvInput) {
				prediccionIdUrl += THIZ.idPrediccion;
			}
			else {
				prediccionIdUrl += THIZ.idPrediccionPoblacion;
			}


			fetch(window.location.origin + "/admin/fases/getClusterProfile?clusterNumber=" + this.clusterSeleccionadoProfile + "&idPrediccion=" + prediccionIdUrl, {
				method: "GET",
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error3 = "Error: " + errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.json();
				})
				.then(data => {
					THIZ.datasetStatistics[0].valor = data.id_prediction;
					THIZ.datasetStatistics[1].valor = data.number_of_variables;
					THIZ.datasetStatistics[2].valor = data.number_of_observations;
					THIZ.datasetStatistics[3].valor = data.target_median;
					THIZ.datasetStatistics[4].valor = data.target_third_quantile;

					THIZ.variables = data.features;

					THIZ.perfilCargado = true;
					THIZ.mostrarCargando = false;
				})
				.catch(error => console.error(error));
		},

		cambiarSeleccion() {
			const THIZ = this;
			THIZ.crear = !this.crear;
			THIZ.continuar = false;
			THIZ.curvasAndPerfilesCreados = false;
			THIZ.curvasCargadas = false;
			THIZ.perfilCargados = false;
			THIZ.descripcionSeleccionada = '';
		},

		cambiarFase() {
			this.$emit('cambiarFase');
		}
	},

	template: `
	<div class="container mb-5 mt-5">
	    <span>
	        <div id="cargando" v-show="mostrarCargando" style="position: fixed; display: none; width: 100%; height: 100%; margin: 0; padding: 0; top: 0; left: 0; background: rgba(255, 255, 255, 0.75); z-index: 9999;">
	            <img id="cargando" src="/images/cargando.gif" style="top: 50%; left: 50%; position: fixed; transform: translate(-50%, -50%); z-index: 9999;"/>
	        </div>
	    </span>
	    
	     <div class="row justify-content-around">
	        <div v-if="error0 != ''" class="col-7 alert alert-danger">
	            {{this.error0}}
	        </div>	 
	    </div>
	    
	    <div class="row justify-content-around">
			<div v-if="csvInput" class="card col-7 rounded-4 p-0 mb-3 shadow">
				<div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 v-if="crear" class="text-center text-white">Crear nueva predicción</h2>
	                <h2 v-if="!crear" class="text-center text-white">Modificar predicción existente</h2>
	            </div>
				<div class="card-body" style="text-align: center;">
					<button @click="cambiarSeleccion(true)" type="button" class="btn btn-custom-color btn-md-5 mb-3" :disabled="crear" style="border: 1px; width:40%">
		                <p style="text-overflow:ellipsis;  overflow: hidden; margin-bottom:0">Crear</p>
		            </button>
		            <button @click="cambiarSeleccion(false)" type="button" class="btn btn-custom-color btn-md-5 mb-3" :disabled="!crear" style="border: 1px; width:40%">
		                <p style="text-overflow:ellipsis;  overflow: hidden; margin-bottom:0">Modificar</p>
		            </button>            
				
					
					<div v-show="crear" class="row justify-content-around">
						<form @submit.prevent="seleccionarPrediccion">
							<div class="form-group mb-3">
								<div class="input-container">
			                        <label for="descripcionSeleccionada" class="input-container-label fw-bold">Introduce una descripcion de la nueva predicción</label>
			                        <input type="text" maxlength="50" class="input-container-input pe-1" v-model="descripcionSeleccionada" id="descripcionSeleccionada" required>
		                    	</div>
		                    </div>
		                    <div class="form-group mb-2">
		                        <div class="row justify-content-center">
		                            <div class="col text-center">
		                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Continuar</button>
		                            </div>
		                        </div>
		                    </div>
		            	</form>
					</div>
					<div v-show="!crear" class="row justify-content-around">
						<div v-if="descripciones.length > 0">
							<form @submit.prevent="seleccionarPrediccion">
								<div class="form-group mb-3">
									<label for="descripcionSeleccionada" class="form-label">Elige una descripción existente para editar la predicción</label>
									<select class="form-select" name="descripciones" id="descripcionSeleccionada" v-model="descripcionSeleccionada" required>
			                       		<option value="" disabled selected></option>
			                       		<option v-for="descripcion in descripciones" :value="descripcion">{{descripcion}}</option>
			                    	</select>
								</div>
								<div class="form-group mb-2">
			                        <div class="row justify-content-center">
			                            <div class="col text-center">
			                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Continuar</button>
			                            </div>
			                        </div>
			                    </div>
							</form>
						</div>
						<div v-else>
							<p class="mt-3 text-center  text-custom-color fs-5 fw-bold">No hay predicciones disponibles. Crea una para poder continuar</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		
		<div v-if="continuar" class="row justify-content-around mb-2">
			<h4 class="text-center text-black">Predicción: {{this.descripcionSeleccionada}}</h4>
	    </div>
	    
	    <div class="row justify-content-around">
	        <div v-if="error1 != ''" class="col-7 alert alert-danger">
	            {{this.error1}}
	        </div>	 
	    </div>
	
	    <div v-if="continuar || !csvInput" class="row justify-content-around">
	        <div class="card col-7 rounded-4 p-0 mb-3 shadow">
	            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Crear curvas de supervivencia y perfil de población</h2>
	            </div>
	            <div class="card-body">
	                <form @submit.prevent="createPopulationAndCurves">
	                    <div v-if="csvInput" class="form-group mb-3">
	                        <label for="csv1" class="form-label">Archivo csv</label>
	                        <input class="form-control" accept=".csv" type="file" id="csv1" ref="csvFile" required />
	                    </div>
	
	                    <div class="form-group mb-2">
	                        <div class="row justify-content-center">
	                            <div class="col text-center">
	                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Ejecutar</button>
	                            </div>
	                        </div>
	                    </div>
	                </form>
	            </div>
	        </div>
	    </div>
	    
	    <div class="row justify-content-around">
	        <div v-if="error2 != ''" class="col-5 alert alert-danger">
	            {{this.error2}}
	        </div>	
	        <div v-if="error2 == ''" class="col-5"></div>
	        
	        <div v-if="error3 == ''" class="col-5"></div>
	         
	        <div v-if="error3 != ''" class="col-5 alert alert-danger">
	            {{this.error3}}
	        </div>	
	         
	    </div>
	    
	    <div class="row justify-content-around">
	        <div v-if="curvasAndPerfilesCreados" class="card col-5 rounded-4 p-0 mb-2 shadow">
	            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Curva de cluster</h2>
	            </div>
	            <div class="card-body">
	                <form @submit.prevent="mostrarClusterSurvivalCurve">
	                    <div class="form-group mb-3">	                 
                    		<label for="clusterSeleccionadoCurves" class="form-label">Número de cluster</label>
							<select class="form-select" name="nCluster" v-model="clusterSeleccionadoCurves" id="clusterSeleccionadoCurves" required>
	                       		<option value="-1">Todas las curvas</option>
	                       		<option v-for="i in nClustersRange" :value="i">{{i}}</option>
	                    	</select>
	                    </div>	                    
	                    	                                   	           	
	                    <div class="form-group mb-2">
	                        <div class="row justify-content-center">
	                            <div class="col text-center">
	                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Mostrar</button>
	                            </div>
	                        </div>
	                    </div>
	                </form>
	            </div>
	        </div>
	        
	        
	        <div v-if="curvasAndPerfilesCreados" class="card col-5 rounded-4 p-0 mb-2 shadow">
	            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Perfil de cluster</h2>
	            </div>
	            <div class="card-body">
	                <form @submit.prevent="mostrarClusterProfile">
	                    <div class="form-group mb-3">
	                        <label for="clusterSeleccionadoProfile" class="form-label">Número de cluster</label>
							<select class="form-select" name="nCluster" v-model="clusterSeleccionadoProfile" id="clusterSeleccionadoProfile" required>
	                       		<option value="-1">Todas las curvas</option>
	                       		<option v-for="i in nClustersRange" :value="i">{{i}}</option>
	                    	</select>
	                    </div>
		             	
	                    <div class="form-group mb-2">
	                        <div class="row justify-content-center">
	                            <div class="col text-center">
	                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Mostrar</button>
	                            </div>
	                        </div>
	                    </div>
	                </form>
	            </div>
	        </div> 
	    </div>
	    
	    <div class="row justify-content-around">
	        <div v-if="curvasCargadas" class="card col-5 rounded-4 p-0 mb-2 shadow">
	        	<h4 v-if="clusterSeleccionadoCurves == -1" class="text-center text-white">Todas las curvas</h4>
	        	<h4 v-else class="text-center text-white">Cluster {{clusterSeleccionadoCurves}}</h4>
	            <div class="card-body">
	                <p><em>¡Imagen creada correctamente! Haz clic sobre ella para descargarla</em></p>
	                <a v-bind:href="curvasUrl" :download="nombreDescargaCurvas">
	                    <img id="curvasUrl" v-bind:src="curvasUrl" style="max-width: 100%;"/>    
	                </a>
	            </div>
	        </div>
	        <div v-else class="col-5 mb-2"/>
	        <div v-if="perfilCargado" class="card col-5 rounded-4 p-0 mb-2 shadow">
	       		<h4 v-if="clusterSeleccionadoProfile == -1" class="text-center text-white">Todas las curvas</h4>
	        	<h4 v-else class="text-center text-white">Cluster {{clusterSeleccionadoProfile}}</h4>
	            <div class="card-body">
	                <h2>Overview</h2>
	                <overview :statistics="this.datasetStatistics"/>
	            </div>
	        </div> 
	        <div v-else class="col-5 mb-2"/>
	    </div>
	
	    <div class="row justify-content-around">
	        <div class="col-5 mb-2"/>
	        <div v-if="perfilCargado" class="card col-5 rounded-4 p-0 mb-2 shadow">
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
	    <div class="row justify-content-center m-2">	
			<button type="button" @click="cambiarFase" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
		</div>
	</div>
	`
});


Vue.component('fase5', {
	props: ['idPrediccionPoblacion', 'csvInput', 'algoritmoOptimo'],
	data: function() {
		return {
			csvFile: '',
			datosCargados: false,
			idModel: '',
			auc: '',
			error: '',
			mostrarCargando: false,
		}
	},


	methods: {

		getModelPerformance() {
			const THIZ = this;
			THIZ.datosCargados = false;
			THIZ.error = '';
			const formData = new FormData();
			THIZ.mostrarCargando = true;


			if (THIZ.csvInput) {
				formData.append('file', this.$refs.csvFile.files[0]);
			}
			else {
				formData.append('idPrediccionPoblacion', THIZ.idPrediccionPoblacion);
				formData.append('algoritmoOptimo', THIZ.algoritmoOptimo);
			}


			fetch(window.location.origin + "/admin/fases/getModelPerformance", {
				method: "POST",
				body: formData
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error = "Error: " + errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.json();
				})
				.then(data => {
					THIZ.idModel = data.id_model;
					THIZ.auc = data.auc + '%';
					THIZ.datosCargados = true;
					THIZ.mostrarCargando = false;
				})
				.catch(error => console.error(error));
		},
		cambiarFase() {
			this.$emit('cambiarFase');
		}
	},


	template: `
	<div class="container mb-5 mt-5">
	    <span>
	        <div id="cargando" v-show="mostrarCargando" style="position: fixed; display: none; width: 100%; height: 100%; margin: 0; padding: 0; top: 0; left: 0; background: rgba(255, 255, 255, 0.75); z-index: 9999;">
	            <img id="cargando" src="/images/cargando.gif" style="top: 50%; left: 50%; position: fixed; transform: translate(-50%, -50%); z-index: 9999;"/>
	        </div>
	    </span>
	
	    <div class="row col-md-6 offset-md-3">
	        <div v-if="error != ''" class="alert alert-danger">
	            {{this.error}}
	        </div>
	        <div class="card rounded-4 p-0 mb-2 shadow">
	            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Rendimiento del modelo</h2>
	            </div>
	            <div class="card-body">
	                <form @submit.prevent="getModelPerformance">
	                    <div v-if="csvInput" class="form-group mb-3">
	                    	<div class="input-container">
		                        <label for="csv" class="input-container-input-file-label fw-bold">Archivo csv</label>
		                        <input class="input-container-input-file" accept=".csv" type="file" id="csv" ref="csvFile" required />
                   			</div>
	                    </div>
	
	                    <div class="form-group mb-2">
	                        <div class="row justify-content-center">
	                            <div class="col text-center">
	                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Ejecutar</button>
	                            </div>
	                        </div>
	                    </div>
	                </form>
	            </div>
	        </div>
	    </div>
	
	    <div class="row col-md-6 offset-md-3 mt-1">
	        <div v-if="datosCargados" class="card rounded-4 p-0 mb-2 shadow">
	            <div class="card-body">
	                <div class="form-group mb-3">
	                    <label>Id model</label>
	                    <input type="text" class="form-control border border-success" v-model="idModel" disabled />
	                </div>
	                <div class="form-group mb-3">
	                    <label>Auc</label>
	                    <input type="text" class="form-control border border-success" v-model="auc" disabled />
	                </div>
	            </div>
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
			csvInput: false,
			idPrediccionPoblacion: '',
			pantalla1: {
				showPantalla: true,
				selectedIdCard: '',
			},
			pantalla2: {
				descripciones: [],
				descripcionSeleccionada: '',
				pacientesPrediccion: '',
				csvUploadPoblacion: '',
				showContinueButton: false,
				uploadPoblacionInfo: false,
				showPantalla: false,
			},
			pantalla3: {
				showPantalla: false,
			},
			faseSeleccionada: 1,
			algoritmoOptimoFase3: ''
		}
	},


	methods: {
		selectCardPantalla1(idCard) {

			const THIZ = this;

			let cardToSelect = document.getElementById(idCard);

			if (THIZ.pantalla1.selectedIdCard.length === 0) {

				this.appendCardStylesPantalla1(idCard);

				THIZ.pantalla1.selectedIdCard = idCard;
			}
			else {

				let cardSelected = document.getElementById(THIZ.pantalla1.selectedIdCard);

				if (cardToSelect.getAttribute('id') !== cardSelected.getAttribute('id')) {

					this.resetearSelectedCardStylesPantalla1(THIZ.pantalla1.selectedIdCard);

					this.appendCardStylesPantalla1(idCard);

					THIZ.pantalla1.selectedIdCard = idCard;

				}
			}

		},

		appendCardStylesPantalla1(toSelectIdCard) {

			let cardToSelect = document.getElementById(toSelectIdCard);

			let cardToSelectIcon = document.createElement("i");

			cardToSelect.setAttribute("style", "border: 5px solid rgb(123, 154, 234); box-shadow: 8px 8px 16px 4px rgb(123, 154, 234);");

			cardToSelectIcon.setAttribute("class", "fases-card-selected-icon fa-solid fa-circle-check");

			cardToSelect.append(cardToSelectIcon);
		},

		resetearSelectedCardStylesPantalla1(selectedIdCard) {

			let cardSelected = document.getElementById(selectedIdCard);

			cardSelected.removeChild(cardSelected.lastChild);

			cardSelected.setAttribute("style", "");
		},
		seleccionarModoAlmacenamientoInformacionPoblacion() {

			const THIZ = this;

			if (THIZ.pantalla1.selectedIdCard === 'card1') {

				fetch(window.location.origin + "/admin/fases/getPredicciones", {
					method: "GET"
				})
					.then(res => res.json())
					.then(descripciones => {

						const THIZ = this;

						THIZ.pantalla2.descripciones = descripciones;
					})
					.catch(error => console.error(error));

				this.resetearSelectedCardStylesPantalla1(THIZ.pantalla1.selectedIdCard);

				THIZ.pantalla1.showPantalla = false;

				THIZ.pantalla2.showPantalla = true;
				THIZ.csvInput = false;
			}
			else if (THIZ.pantalla1.selectedIdCard === 'card2') {
				THIZ.pantalla1.showPantalla = false;
				THIZ.pantalla3.showPantalla = true;
				THIZ.csvInput = true;
			}

		},
		seleccionarRadioButton(event) {

			const THIZ = this;

			THIZ.pantalla2.showContinueButton = false;
			THIZ.pantalla2.csvUploadPoblacion = '';

			let radios = document.querySelectorAll('input[type="radio"]');

			for (let i = 0; i < radios.length; i++) {
				let radioButtonContainer = radios[i].closest('.radio-button-container');
				let radioButtonLabel = radios[i].nextElementSibling;
				if (radios[i].id === event.target.id) {
					radioButtonContainer.setAttribute("style", "background-color: rgb(223, 231, 251); border: 3px solid rgb(123, 154, 234);");
					radioButtonLabel.setAttribute("style", "color: rgb(91, 130, 232)");
				}
				else {
					radios[i].checked = false;
					radioButtonContainer.setAttribute("style", "");
					radioButtonLabel.setAttribute("style", "");
				}

			}

			if (event.target.id === 'radioButton1') {
				THIZ.pantalla2.uploadPoblacionInfo = false;
				THIZ.pantalla2.showContinueButton = true;
			}
			else if (event.target.id === 'radioButton2') {
				THIZ.pantalla2.uploadPoblacionInfo = true;
			}

		},
		archivoSeleccionado() {

			const THIZ = this;

			THIZ.pantalla2.csvUploadPoblacion = this.$refs.csvUploadPoblacion.files[0];
			THIZ.pantalla2.showContinueButton = true;

		},
		seleccionarPrediccionAndPoblacionInfo() {

			const THIZ = this;

			const formData = new FormData();

			if (THIZ.pantalla2.csvUploadPoblacion !== '') {
				formData.append("file", THIZ.pantalla2.csvUploadPoblacion);
			}

			fetch(window.location.origin + "/admin/fases/guardarInformacionPacientes?descripcion=" + this.pantalla2.descripcionSeleccionada, {
				method: "POST",
				body: formData
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						//THIZ.error = "Error: " + errorMessage;

						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.text();
				})
				.then(idPrediccionPoblacion => {

					const THIZ = this;

					THIZ.idPrediccionPoblacion = idPrediccionPoblacion;

					THIZ.pantalla2.showPantalla = false;

					THIZ.pantalla3.showPantalla = true;

				})
				.catch(error => console.error(error));

		},

		cambiarFase(algoritmo) {
			
			const THIZ = this;
			
			if(algoritmo){
				THIZ.algoritmoOptimoFase3 = algoritmo;
			}	
			THIZ.faseSeleccionada = THIZ.faseSeleccionada + 1;
			var fase = '#fase' + String(this.faseSeleccionada);
			$(fase).click();
		},

		cambioPantalla3a1(THIZ) {

			THIZ.csvInput = false;

			THIZ.pantalla1.selectedIdCard = '';
		},

		cambioPantalla3a2Y2a1(THIZ, cambio2a1) {

			if (cambio2a1) {
				THIZ.csvInput = false;

				THIZ.pantalla1.selectedIdCard = '';

				THIZ.pantalla2.descripciones = [];
			}

			THIZ.idPrediccionPoblacion = '';

			THIZ.pantalla2.descripcionSeleccionada = '';

			THIZ.pantalla2.pacientesPrediccion = '';

			THIZ.pantalla2.csvUploadPoblacion = '';

			THIZ.pantalla2.showContinueButton = false;

			THIZ.pantalla2.uploadPoblacionInfo = false;

		},
		cambiarShowPantallas(nuevaPantalla, antiguaPantalla) {

			nuevaPantalla.showPantalla = true;

			antiguaPantalla.showPantalla = false;
		},
		goBack() {

			const THIZ = this;

			if (THIZ.pantalla3.showPantalla) {

				if (THIZ.csvInput) {

					this.cambiarShowPantallas(THIZ.pantalla1, THIZ.pantalla3);

					this.cambioPantalla3a1(THIZ);

				}
				else {

					this.cambiarShowPantallas(THIZ.pantalla2, THIZ.pantalla3);

					this.cambioPantalla3a2Y2a1(THIZ,false);

				}

			}
			else if (THIZ.pantalla2.showPantalla) {

				this.cambiarShowPantallas(THIZ.pantalla1, THIZ.pantalla2);

				this.cambioPantalla3a2Y2a1(THIZ, true);

			}
		}

	},

	//	updated() {
	//		$('#fase2').hide();
	//		$('#fase3').hide();
	//		$('#fase4').hide();
	//		$('#fase5').hide();
	//	},


	watch: {
		'pantalla2.descripcionSeleccionada': function(newValue, oldValue) {

			const THIZ = this;

			THIZ.pantalla2.uploadPoblacionInfo = false;
			THIZ.pantalla2.pacientesPrediccion = '';
			THIZ.pantalla2.showContinueButton = false;
			THIZ.pantalla2.csvUploadPoblacion = '';


			if (newValue.length > 0) {

				fetch(window.location.origin + "/admin/fases/getPacientesPrediccion?descripcion=" + newValue, {
					method: "GET"
				})
					.then(async res => {
						if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
							const errorMessage = await res.text();
							//THIZ.error = "Error: " + errorMessage;

							throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
						}
						return res.text();
					})
					.then(pacientes => {

						THIZ.pantalla2.pacientesPrediccion = Number(pacientes);

					})
					.catch(error => console.error(error));
			}
		}



	},
	template: `
	<div class="container-fluid pt-2 position-relative">	
	
	
		<div v-if="pantalla1.showPantalla" class="container pt-2">
			<div class="row justify-content-around" style="margin-top: 65px;">
	
				<div class="col-md-4 mb-5">
					<div class="row justify-content-center">
						<div id="card1" class="fases-card" @click="selectCardPantalla1('card1')">
							<i class="fases-card-i fa-solid fa-database"></i>
							<p class="fases-card-p text-center mb-0">Usar información de la población de la base de datos</p>
						</div>
					</div>
				</div>
	
				<div class="col-md-4 mb-5">
					<div class="row justify-content-center">
						<div id="card2" class="fases-card" @click="selectCardPantalla1('card2')">
							<i class="fases-card-i fa-solid fa-wrench"></i>
							<p class="fases-card-p text-center mb-0">Usar tu propia información de la población</p>
						</div>
					</div>
				</div>
			</div>
			
			<div v-if="pantalla1.selectedIdCard != ''" class="row justify-content-center">	
					<button type="button" @click="seleccionarModoAlmacenamientoInformacionPoblacion" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
			</div>
		</div>
		
		
		<div v-if="pantalla2.showPantalla" class="container pt-2">
		
			
			<button type="button" @click="goBack" class="back-button"><i class="fa-solid fa-arrow-left back-button-i"></i> Atrás</button>	
			
		
			<div class="row justify-content-around" style="margin-top: 65px;">
				<div class="col-md-6">
					<div class="card rounded-4 p-0 shadow">
			            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
			                <h2 class="text-center text-white">Seleccionar predicción</h2>
			            </div>
			            <div class="card-body">
			                <form id="selectPrediccionForm" @submit.prevent="seleccionarPrediccionAndPoblacionInfo">
			                	<div v-if="pantalla2.descripciones.length == 0">
			                		<h4 class="text-center">No hay predicciones creadas</h4>
			                		<h4 class="text-center"><a :href="'predicciones'">Crea una aquí</a></h4>
			  
			                	</div>			           
			                	<div v-else class="form-group mb-3">
					                <label for="selectDescripcion" class="form-label text-custom-light-color fw-bold" style="font-size: 22px;">Seleccione una predicción</label>
									
									<select class="input-select-prediccion" id="selectDescripcion" name="selectDescripcion" v-model="pantalla2.descripcionSeleccionada" required>
			                       		<option class="input-select-prediccion-option" v-for="descripcion in pantalla2.descripciones" :value="descripcion">{{descripcion}}</option>
			                    	</select>
				                    	
		                    	</div>
		                    	
		                    	<div v-if="pantalla2.pacientesPrediccion > 0" class="radio-button-container">
								  						  
									  <input class="radio-button" type="radio" @change="seleccionarRadioButton" name="radioButton1" id="radioButton1">
									  <label class="radio-button-label" for="radioButton1">
									    Utilizar datos de población de la base de datos
									  </label>
								</div>
										
								<div v-if="pantalla2.pacientesPrediccion > 0" class="radio-button-container">
								 	  <input class="radio-button" type="radio" @change="seleccionarRadioButton" name="radioButton2" id="radioButton2">
									  <label class="radio-button-label" for="radioButton2">
									    Subir mi csv de población a la base de datos
									  </label>
								</div>
								
								<div v-if="pantalla2.pacientesPrediccion === 0 || pantalla2.uploadPoblacionInfo" class="form-group mt-4 mb-3">
			                    	<div class="input-container">
				                        <label for="csv" class="input-container-input-file-label fw-bold">Archivo csv</label>
				                        <input class="input-container-input-file" accept=".csv" @change="archivoSeleccionado" type="file" id="csv" ref="csvUploadPoblacion" required />
		                   			</div>
			                    </div>
			                    
			                     <div v-if="pantalla2.showContinueButton" class="form-group mt-4 mb-2">
			                        <div class="row justify-content-center">
			                            <div class="col text-center">
			                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Continuar</button>
			                            </div>
			                        </div>
		                   		</div>
		                   		
			                </form>
			            </div>
		        	</div>
	        	</div>				
			</div>
			
			
			
		</div>
		
	    
	    <div v-if="pantalla3.showPantalla" class="container pt-2"> 
	    
	    	<button type="button" @click="goBack" class="back-button"><i class="fa-solid fa-arrow-left back-button-i"></i> Atrás</button>	
	    
	    	<div class="row" style="margin-top: 65px;">
	    
			    <div class="col-12 mb-3">
					<h2 class="text-center fw-bold fst-italic text-custom-color fs-1">F<span class="text-custom-light-color">ase</span>s</h2>
				</div>
				
				<ul class="nav nav-pills justify-content-around" id="pills-tab" role="tablist" style="border: 3px solid #7B9AEA; padding-bottom:8px; padding-left:8px; padding-right:8px; border-radius:9px">
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" ref="fase1" id="fase1" data-bs-toggle="pill" data-bs-target="#nClusters-content" type="button" role="tab" aria-controls="nClusters-content" aria-selected="true" v-show="this.faseSeleccionada==1">Nº Óptimo de Clusters</button>
				  </li>
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" id="fase2" data-bs-toggle="pill" data-bs-target="#subPopulations-content" type="button" role="tab" aria-controls="subPopulations-content" aria-selected="false" v-show="this.faseSeleccionada==2">Subpoblaciones</button>
				  </li>
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" id="fase3" data-bs-toggle="pill" data-bs-target="#varianceMetrics-content" type="button" role="tab" aria-controls="varianceMetrics-content" aria-selected="false" v-show="faseSeleccionada==3">Métricas de varianza</button>
				  </li>
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" id="fase4" data-bs-toggle="pill" data-bs-target="#populationProfilesGraphics-content" type="button" role="tab" aria-controls="populationProfilesGraphics-content" aria-selected="false" v-show="faseSeleccionada==4">Gráficas y estadísticas de población</button>
				  </li>
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" id="fase5" data-bs-toggle="pill" data-bs-target="#modelPerformance-content" type="button" role="tab" aria-controls="modelPerformance-content" aria-selected="false" v-show="faseSeleccionada==5">Rendimiento del modelo</button>
				  </li>
				</ul>
				<div class="tab-content" id="pills-tabContent">
				  <div class="tab-pane fade" id="nClusters-content" role="tabpanel" aria-labelledby="fase1" tabindex="0">
				  	<fase1 :idPrediccionPoblacion="this.idPrediccionPoblacion" :csvInput="this.csvInput" @cambiarFase="cambiarFase"/>
				  </div>
				  <div class="tab-pane fade" id="subPopulations-content" role="tabpanel" aria-labelledby="fase2" tabindex="0">
				  	<fase2 :idPrediccionPoblacion="this.idPrediccionPoblacion" :csvInput="this.csvInput" @cambiarFase="cambiarFase" />
				  </div>
				  <div class="tab-pane fade" id="varianceMetrics-content" role="tabpanel" aria-labelledby="fase3" tabindex="0">
				  	<fase3 :idPrediccionPoblacion="this.idPrediccionPoblacion" :csvInput="this.csvInput" @cambiarFase="cambiarFase"/>
				  </div>
				  <div class="tab-pane fade" id="populationProfilesGraphics-content" role="tabpanel" aria-labelledby="fase4" tabindex="0">
				  	<fase4 :idPrediccionPoblacion="this.idPrediccionPoblacion" :csvInput="this.csvInput" :algoritmoOptimo="this.algoritmoOptimoFase3" @cambiarFase="cambiarFase"/>
				  </div>
				  <div class="tab-pane fade" id="modelPerformance-content" role="tabpanel" aria-labelledby="fase5" tabindex="0">
				  	<fase5 :idPrediccionPoblacion="this.idPrediccionPoblacion" :csvInput="this.csvInput" :algoritmoOptimo="this.algoritmoOptimoFase3" @cambiarFase="cambiarFase"/>
				  </div>
				</div>
			
			</div>
			
		</div>
				
	</div>
	`
})