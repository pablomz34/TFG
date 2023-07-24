Vue.component('fase1', {
	props: ['idPrediccionPoblacion', 'csvInput', 'indices'],
	data: function() {
		return {
			nClusters: '',
			csvFile: '',
			imagenCreada: false,
			imagenUrl: '',
			error: '',
			mostrarCargando: false,
			siguienteFase: false,
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
				formData.append('indices', this.indices);
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
					THIZ.siguienteFase = true;
					THIZ.mostrarCargando = false;
				})
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
	    
	    <div v-if="!csvInput && siguienteFase" class="row justify-content-center m-2">	
			<button type="button" @click="cambiarFase" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
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
	</div>
	`
});

Vue.component('fase2', {
	props: ['idPrediccionPoblacion', 'csvInput', 'indices'],
	data: function() {
		return {
			nClustersAglomerativo: '',
			nClustersKModes: '',
			csvFile: '',
			error: '',
			mostrarCargando: false,
			siguienteFase: false,
			searchedAlgoritmo: '',
			modalAddAlgoritmos: '',
			algoritmosCoincidentes: [],
			algoritmosPreSeleccionados: [],
			algoritmosSeleccionados: []
		}
	},
	mounted() {

		const THIZ = this;

		let agglomerative_dict = {};

		agglomerative_dict["nombreAlgoritmo"] = "agglomerative";
		agglomerative_dict["nClusters"] = '';

		THIZ.algoritmosSeleccionados.push(agglomerative_dict);

		let kmodes_dict = {};

		kmodes_dict["nombreAlgoritmo"] = "kmodes";
		kmodes_dict["nClusters"] = '';

		THIZ.algoritmosSeleccionados.push(kmodes_dict);

	},

	methods: {

		getSubPopulations: function() {

			const THIZ = this;
			THIZ.mostrarCargando = true;
			THIZ.error = '';

			const formData = new FormData();

			const algoritmosSeleccionadosJson = JSON.stringify(this.algoritmosSeleccionados);

			formData.append('algoritmos', algoritmosSeleccionadosJson);

			if (THIZ.csvInput) {
				formData.append('file', this.$refs.csvFile.files[0]);
			}
			else {
				formData.append('idPrediccionPoblacion', THIZ.idPrediccionPoblacion);
				formData.append('indices', this.indices);
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
					THIZ.siguienteFase = true;
					THIZ.mostrarCargando = false;

				})
				.catch(error => console.error(error));
		},
		cambiarFase() {
			this.$emit('cambiarFase');
		},
		showModalAddAlgoritmos() {

			const THIZ = this;

			this.resetearModalAddAlgoritmos();

			if (this.modalAddAlgoritmos.length === 0) {

				let modal = new bootstrap.Modal(document.getElementById('addAlgoritmosModal'));

				THIZ.modalAddAlgoritmos = modal;
			}

			this.modalAddAlgoritmos.show();

		},
		hideModalAddAlgoritmos() {

			this.modalAddAlgoritmos.hide();
		},
		resetearModalAddAlgoritmos() {

			const THIZ = this;

			THIZ.searchedAlgoritmo = '';

			let algoritmosCoincidentesRow = document.getElementById("algoritmosCoincidentesRow");

			this.resetearModalBodyRow(algoritmosCoincidentesRow);

			let algortimosPreSeleccionadosRow = document.getElementById("algortimosPreSeleccionadosRow");

			this.resetearModalBodyRow(algortimosPreSeleccionadosRow);

			THIZ.algoritmosCoincidentes = [];

			THIZ.algoritmosPreSeleccionados = [];

			this.createNoResultComponent(algoritmosCoincidentesRow, "¡No hay ninguna coincidencia!");

		},
		crearLabelComponent(row, message) {

			let label = document.createElement("div");

			label.setAttribute("class", "results-search-label");

			label.innerHTML = message;

			row.append(label);
		},
		createNoResultComponent(row, message) {

			this.crearLabelComponent(row, "Coincidencias");

			let noResultsComponent = document.createElement("div");

			noResultsComponent.setAttribute("class", "noResults-component");

			noResultsComponent.innerHTML = message;

			row.append(noResultsComponent);
		},
		resetearModalBodyRow(row) {

			while (row.firstChild) {
				row.removeChild(row.firstChild);
			}

		},
		crearAlgoritmosCoincidentesRowComponents(row) {

			const THIZ = this;

			this.crearLabelComponent(row, "Coincidencias");

			for (let i = 0; i < this.algoritmosCoincidentes.length; i++) {

				let algoritmoContainer = document.createElement('div');

				algoritmoContainer.setAttribute("class", "add-algoritmos-container");

				algoritmoContainer.addEventListener('click', function(event) {

					let algoritmosPreSeleccionadosRow = document.getElementById('algortimosPreSeleccionadosRow');

					if (THIZ.algoritmosPreSeleccionados.length === 0) {

						let label = document.createElement("div");

						label.setAttribute("class", "results-search-label");

						label.innerHTML = "Preseleccionados";

						algoritmosPreSeleccionadosRow.append(label);
					}

					let algoritmoComponent = document.createElement("div");

					let algoritmoComponentIcon = document.createElement("i");

					algoritmoComponent.setAttribute("class", "add-algoritmos-container");

					algoritmoComponent.setAttribute("style", "box-shadow: 3px 3px 6px 2px rgb(39, 90, 224); border: 3px solid rgb(39, 90, 224); color: rgb(39, 90, 224);")

					algoritmoComponent.classList.add('seleccionado');

					algoritmoComponent.innerHTML = THIZ.algoritmosCoincidentes[i].nombreAlgoritmo;

					algoritmoComponentIcon.setAttribute("class", "fa-solid fa-circle-check add-algoritmos-container-i");

					algoritmoComponent.append(algoritmoComponentIcon);

					algoritmosPreSeleccionadosRow.append(algoritmoComponent);

					THIZ.algoritmosPreSeleccionados.push(THIZ.algoritmosCoincidentes[i]);

					event.target.remove();

					let algoritmosCoincidentesRow = document.getElementById("algoritmosCoincidentesRow");

					if (algoritmosCoincidentesRow.children.length === 1) {

						if (algoritmosCoincidentesRow.querySelectorAll(".results-search-label").length === 1) {
							algoritmosCoincidentesRow.removeChild(algoritmosCoincidentesRow.firstChild);
						}
					}
				});

				algoritmoContainer.innerHTML = THIZ.algoritmosCoincidentes[i].nombreAlgoritmo;

				row.append(algoritmoContainer);
			}

		},
		buscarAlgoritmosCoincidentes() {


			const formData = new FormData();

			const algoritmosSeleccionadosJson = JSON.stringify(this.algoritmosSeleccionados);

			formData.append('algoritmosSeleccionados', algoritmosSeleccionadosJson);

			const algoritmosPreSeleccionadosJson = JSON.stringify(this.algoritmosPreSeleccionados);

			formData.append('algoritmosPreSeleccionados', algoritmosPreSeleccionadosJson);

			fetch(window.location.origin + "/admin/fases/buscarAlgoritmosCoincidentes?nombreAlgoritmo=" + this.searchedAlgoritmo, {
				method: "POST",
				body: formData
			})
				.then(res => res.json())
				.then(res => {

					const THIZ = this;

					let algoritmosCoincidentesRow = document.getElementById("algoritmosCoincidentesRow");

					this.resetearModalBodyRow(algoritmosCoincidentesRow);

					if (res.length > 0) {

						THIZ.algoritmosCoincidentes = res;

						this.crearAlgoritmosCoincidentesRowComponents(algoritmosCoincidentesRow, res);
					}
					else {
						this.createNoResultComponent(algoritmosCoincidentesRow, "¡No hay ninguna coincidencia!");
					}

				})
				.catch(error => console.error(error));
		},
		addAlgoritmos() {

			const THIZ = this;

			this.algoritmosPreSeleccionados.forEach(function(algoritmo) {
				THIZ.algoritmosSeleccionados.push(algoritmo);
			})

			THIZ.algoritmosPreSeleccionados = [];

			THIZ.modalAddAlgoritmos.hide();

		},
		deseleccionarAlgoritmo(index) {

			const THIZ = this;

			THIZ.algoritmosSeleccionados.splice(index, 1);
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
	                
	                    <div v-for="(algoritmo, index) in algoritmosSeleccionados.slice(0,2)" class="form-group mb-3">
	                    	<div class="input-container">
		                        <label class="input-container-label fw-bold" :for="'nClusters' + algoritmo.nombreAlgoritmo">Nº de clusters del algoritmo {{algoritmo.nombreAlgoritmo}}</label>
		                        <input type="number" min="1" max="8" class="input-container-input pe-1" v-model="algoritmo.nClusters" :id="'nClusters' + algoritmo.nombreAlgoritmo" required />
	                    	</div>
	                    </div>
	                    
	                    <div v-if="algoritmosSeleccionados.length > 2" v-for="(algoritmo, index) in algoritmosSeleccionados.slice(2)" class="form-group mb-3">
	                    	<div class="input-container">
		                        <label class="input-container-label fw-bold" :for="'nClusters' + algoritmo.nombreAlgoritmo">Nº de clusters del algoritmo {{algoritmo.nombreAlgoritmo}}</label>
		                       	<input type="number" min="1" max="8" class="input-container-input pe-1" v-model="algoritmo.nClusters" :id="'nClusters' + algoritmo.nombreAlgoritmo" required />	
	                    		<i @click="deseleccionarAlgoritmo(index + 2)" class="fa-solid fa-xmark input-container-borrar-algoritmo-i"></i>
	                    	</div>
	                    </div>
	
	                    <div v-if="csvInput" class="form-group mb-3">
	                    	<div class="input-container">
		                        <label for="csv" class="input-container-input-file-label fw-bold">Archivo csv</label>
		                        <input class="input-container-input-file" accept=".csv" type="file" id="csv" ref="csvFile" required />
                   			</div>
	                    </div>
	
	                    <div class="form-group mb-2">
	                        <div class="row justify-content-around">
	                        
	                        	<div v-if="algoritmosSeleccionados.length > 0" class="col text-center mb-2">
	                            	<button @click="showModalAddAlgoritmos" class="btn btn-outline-custom-color fs-5 fw-semibold" type="button"><i class="fa-solid fa-plus"></i>  Algoritmos</button>
	                            </div>
	                            
	                            <div class="modal fade" id="addAlgoritmosModal" tabindex="-1" aria-hidden="true">
									<div class="modal-dialog modal-dialog-centered">
										<div class="modal-content">
											<div class="modal-header bg-custom-light-color">
											
												<form class="w-100">
													<div class="search-input-container">
														<input class="search-input" type="text" placeholder="Buscar algoritmo"
															v-model="searchedAlgoritmo" @keyup="buscarAlgoritmosCoincidentes"
															id="seleccionarAlgoritmo">
														<i class="search-input-container-i fa-solid fa-magnifying-glass"></i>
													</div>
		
												</form>
											
											</div>
											<div class="modal-body" style="max-height: 350px!important; overflow-y: auto !important;">
												
												<div id="algoritmosCoincidentesRow" class="row justify-content-center mb-2"></div>		
												
												<div id="algortimosPreSeleccionadosRow" class="row justify-content-center mb-2"></div>		
											</div>
											<div v-if="algoritmosPreSeleccionados.length > 0" class="modal-footer justify-content-center">
												
												<button @click="addAlgoritmos" class="btn btn-outline-custom-color fs-5 fw-semibold" type="button">Añadir</button>
													
											</div>
										</div>
									</div>
								</div>
	                            
	                            <div class="col text-center mb-2">
	                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Ejecutar</button>
	                            </div>
	                            
	                        </div>
	                        
	                    </div>
	                </form>
	            </div>
	        </div>
	    </div>
	    <div v-if="!csvInput && siguienteFase" class="row justify-content-center m-2">	
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
			algoritmoOptimo: '',
			siguienteFase: false,
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

					for (let i = 1; i < THIZ.lista.length; i++) {

						if (THIZ.lista[i].total_wc <= minimoWc && THIZ.lista[i].total_bc >= maximoBc) {
							minimoWc = THIZ.lista[i].total_wc;
							maximoBc = THIZ.lista[i].total_bc;
							nombre_algoritmo = THIZ.lista[i].metric;
						}

					}

					THIZ.algoritmoOptimo = nombre_algoritmo;

					THIZ.datosCargados = true;
					THIZ.siguienteFase = true;
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
	
	    <div class="col-md-6 offset-md-3">
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
	    
	    
	    <div v-if="!csvInput && siguienteFase" class="row justify-content-center m-2">	
			<button type="button" @click="cambiarFase" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
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
	    
	   	<div v-if="!csvInput && siguienteFase" class="col-md-4 offset-md-4 text-center mt-2 alert alert-success">
			El algoritmo que se usará en fases siguientes es: {{this.algoritmoOptimo}}
	    </div>
	</div>
	`
});




Vue.component('fase4', {
	props: ['idPrediccionPoblacion', 'csvInput', 'algoritmoOptimo', 'indices'],
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
			siguienteFase: false,
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
				formData.append('indices', this.indices);
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
					THIZ.siguienteFase = true;
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
				
					
					<div v-if="crear" class="row justify-content-around">
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
					<div v-else class="row justify-content-around">
						<div v-if="descripciones.length > 0">
							<form @submit.prevent="seleccionarPrediccion">
								<div class="form-group mb-3">
									<div class="input-container">
										<label for="descripcionSeleccionada" class="input-container-label fw-bold">Seleccione una descripción existente</label>
										<select class="input-container-select" name="descripciones" id="descripcionSeleccionada" v-model="descripcionSeleccionada" required>
				                       		<option class="input-container-select-option" value="" disabled selected></option>
				                       		<option class="input-container-select-option" v-for="descripcion in descripciones" :value="descripcion">{{descripcion}}</option>
				                    	</select>
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
	            <div v-if="csvInput" class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Crear curvas de supervivencia y perfil de población</h2>
	            </div>
	            <div v-else class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Crear curvas de supervivencia y perfil de población. Algoritmo óptimo: {{this.algoritmoOptimo}}</h2>
	            </div>
	            <div class="card-body">
	                <form @submit.prevent="createPopulationAndCurves">
	                    <div v-if="csvInput" class="form-group mb-3">
	                    	<div class="input-container">
		                        <label for="csv1" class="input-container-input-file-label fw-bold">Archivo csv</label>
		                        <input class="input-container-input-file" accept=".csv" type="file" id="csv1" ref="csvFile" required />
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
	    
	    <div v-if="!csvInput && siguienteFase" class="row justify-content-center m-2">	
			<button type="button" @click="cambiarFase" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
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
	                    	<div class="input-container">	                 
	                    		<label for="clusterSeleccionadoCurves" class="input-container-label fw-bold">Número de cluster</label>
								<select class="input-container-select" name="nCluster" v-model="clusterSeleccionadoCurves" id="clusterSeleccionadoCurves" required>
		                       		<option class="input-container-select-option" value="-1">Todas las curvas</option>
		                       		<option class="input-container-select-option" v-for="i in nClustersRange" :value="i">{{i}}</option>
		                    	</select>
	                    	</div>
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
	                    	<div class="input-container">
		                        <label for="clusterSeleccionadoProfile" class="input-container-label fw-bold">Número de cluster</label>
								<select class="input-container-select" name="nCluster" v-model="clusterSeleccionadoProfile" id="clusterSeleccionadoProfile" required>
		                       		<option class="input-container-select-option" value="-1">Todas las curvas</option>
		                       		<option class="input-container-select-option" v-for="i in nClustersRange" :value="i">{{i}}</option>
		                    	</select>
	                    	</div>
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
	</div>
	`
});


Vue.component('fase5', {
	props: ['idPrediccionPoblacion', 'csvInput', 'algoritmoOptimo', 'indices'],
	data: function() {
		return {
			csvFile: '',
			datosCargados: false,
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
				formData.append('indices', this.indices);
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
					THIZ.auc = data.auc + '%';
					THIZ.datosCargados = true;
					THIZ.mostrarCargando = false;
				})
				.catch(error => console.error(error));
		},
	},


	template: `
	<div class="container mb-5 mt-5">
	    <span>
	        <div id="cargando" v-show="mostrarCargando" style="position: fixed; display: none; width: 100%; height: 100%; margin: 0; padding: 0; top: 0; left: 0; background: rgba(255, 255, 255, 0.75); z-index: 9999;">
	            <img id="cargando" src="/images/cargando.gif" style="top: 50%; left: 50%; position: fixed; transform: translate(-50%, -50%); z-index: 9999;"/>
	        </div>
	    </span>
	
	    <div class="row col-md-6 offset-md-3 text-center">
	        <div v-if="error != ''" class="alert alert-danger">
	            {{this.error}}
	        </div>
	        <div class="card rounded-4 p-0 mb-2 shadow">
	            <div v-if="csvInput" class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Rendimiento del modelo</h2>
	            </div>
	            <div v-if="!csvInput" class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Rendimiento del modelo con algoritmo {{this.algoritmoOptimo}}</h2>
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
	
	    <div class="row col-md-4 offset-md-4 mt-1 justify-center text-center">
	        <div v-if="datosCargados" class="card rounded-4 p-0 mb-2 shadow">
	            <div class="card-body">	            
	                <div class="form-group mb-3">
	                	<div class="input-container">
	                        <label class="input-container-label fw-bold">AUC</label>
	                        <input type="text" class="input-container-input pe-1 fw-bold" v-model="auc" disabled/>
	                	</div>
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
			indicesVariablesClinicasSeleccionadas: [],
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
				showSeleccionarVariableButton: false,
				numVariablesClinicas: '',
				searchedVariableClinica: '',
				variablesClinicasPreSeleccionadas: [],
				variablesClinicasSeleccionadas: [],
				variablesClinicasCoincidentes: [],
				seleccionarVariablesClinicasModal: '',
				showPantalla: false
			},
			pantalla4: {
				showPantalla: false
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
				THIZ.pantalla4.showPantalla = true;
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

					fetch(window.location.origin + "/admin/fases/getMaximoVariablesClinicas?idPrediccionPoblacion=" + idPrediccionPoblacion, {
						method: "GET"
					})
						.then(res => res.text())
						.then(numVariablesClinicas => {

							THIZ.pantalla2.showPantalla = false;

							THIZ.pantalla3.showPantalla = true;

							THIZ.pantalla3.numVariablesClinicas = Number(numVariablesClinicas);

						})
						.catch(error => console.error(error));

				})
				.catch(error => console.error(error));

		},

		cambiarFase(algoritmo) {

			const THIZ = this;

			if (algoritmo) {
				THIZ.algoritmoOptimoFase3 = algoritmo;
			}
			THIZ.faseSeleccionada = this.faseSeleccionada + 1;
			var fase = '#fase' + String(this.faseSeleccionada);

			var myButton = document.getElementById("fase" + this.faseSeleccionada);
			myButton.disabled = false;
			$(fase).click();
		},

		resetearVariablesPantalla(identificador) {

			if (identificador === 0) {
				this.resetearPantalla1ConCsvInput();
			}
			else if (identificador === 1) {
				this.resetearPantalla1SinCsvInput();
			}
			else if (identificador === 2) {

				this.resetearPantalla2();

			}
			else if (identificador === 3) {

				this.resetearPantalla3();

			}
		},

		resetearPantalla1ConCsvInput() {

			const THIZ = this;

			THIZ.csvInput = false;

			THIZ.pantalla1.selectedIdCard = '';
		},
		resetearPantalla1SinCsvInput() {

			const THIZ = this;

			THIZ.csvInput = false;

			THIZ.pantalla1.selectedIdCard = '';

			THIZ.pantalla2.descripciones = [];

			this.resetearPantalla2();
		},
		resetearPantalla2() {
			const THIZ = this;

			THIZ.pantalla3.numVariablesClinicas = '';

			THIZ.idPrediccionPoblacion = '';

			THIZ.pantalla2.descripcionSeleccionada = '';

			THIZ.pantalla2.pacientesPrediccion = '';

			THIZ.pantalla2.csvUploadPoblacion = '';

			THIZ.pantalla2.showContinueButton = false;

			THIZ.pantalla2.uploadPoblacionInfo = false;

			this.resetearPantalla3();
		},
		resetearPantalla3() {
			const THIZ = this;

			THIZ.pantalla3.showSeleccionarVariableButton = false;

			THIZ.pantalla3.searchedVariableClinica = '';

			THIZ.pantalla3.variablesClinicasPreSeleccionadas = [];

			THIZ.pantalla3.variablesClinicasSeleccionadas = [];

			THIZ.pantalla3.variablesClinicasCoincidentes = [];

			THIZ.pantalla3.seleccionarVariablesClinicasModal = '';

		},
		cambiarShowPantallas(nuevaPantalla, antiguaPantalla) {

			nuevaPantalla.showPantalla = true;

			antiguaPantalla.showPantalla = false;
		},
		goBack() {

			const THIZ = this;
			THIZ.faseSeleccionada = 1;

			if (THIZ.pantalla4.showPantalla) {

				if (THIZ.csvInput) {

					this.cambiarShowPantallas(THIZ.pantalla1, THIZ.pantalla4);

					this.resetearVariablesPantalla(0);

				}
				else {

					this.cambiarShowPantallas(THIZ.pantalla3, THIZ.pantalla4);

					this.resetearVariablesPantalla(3);

				}

			}
			else if (THIZ.pantalla2.showPantalla) {
				this.cambiarShowPantallas(THIZ.pantalla1, THIZ.pantalla2);

				this.resetearVariablesPantalla(1);
			}
			else if (THIZ.pantalla3.showPantalla) {
				this.cambiarShowPantallas(THIZ.pantalla2, THIZ.pantalla3);

				this.resetearVariablesPantalla(2);
			}

		},
		showModalSeleccionarVariablesClinicas() {

			const THIZ = this;

			if (this.pantalla3.seleccionarVariablesClinicasModal.length === 0) {
				let modal = new bootstrap.Modal(document.getElementById('seleccionarVariablesClinicasModal'));

				THIZ.pantalla3.seleccionarVariablesClinicasModal = modal;
			}

			this.iniciarModalSeleccionarVariablesClinicas();

			THIZ.pantalla3.seleccionarVariablesClinicasModal.show();

		},
		iniciarModalSeleccionarVariablesClinicas() {

			const THIZ = this;

			THIZ.pantalla3.searchedVariableClinica = '';

			THIZ.pantalla3.showSeleccionarVariableButton = false;

			let modalBodyRow = document.getElementById('modalBodyRow');

			let modalBodyPreseleccionadas = document.getElementById('modalBodyPreseleccionadas');

			this.resetearModalBody(modalBodyRow);

			this.resetearModalBobyPreseleccionadas(modalBodyPreseleccionadas);

			if (this.pantalla3.variablesClinicasSeleccionadas.length === this.pantalla3.numVariablesClinicas) {
				this.createNoResultComponent(modalBodyRow, "¡Ya has seleccionado todas las variables!");
			}
			else {
				this.createNoResultComponent(modalBodyRow, "¡No hay ninguna coincidencia!");
			}


		},
		resetearModalBobyPreseleccionadas(modalBodyPreseleccionadas) {
			while (modalBodyPreseleccionadas.firstChild) {
				modalBodyPreseleccionadas.removeChild(modalBodyPreseleccionadas.firstChild);
			}
		},

		resetearModalBody(modalBodyRow) {

			while (modalBodyRow.firstChild) {
				modalBodyRow.removeChild(modalBodyRow.firstChild);
			}
		},

		createNoResultComponent(modalBodyRow, message) {

			this.crearSeleccionarVariablesClinicasLabel(modalBodyRow);

			let noResultsComponent = document.createElement("div");

			noResultsComponent.setAttribute("class", "noResults-component");

			noResultsComponent.innerHTML = message;

			modalBodyRow.append(noResultsComponent);
		},

		crearSeleccionarVariablesClinicasLabel(modalBodyRow) {

			let seleccionarVariablesClinicasLabel = document.createElement("div");

			seleccionarVariablesClinicasLabel.setAttribute("class", "results-search-label");

			seleccionarVariablesClinicasLabel.innerHTML = "Coincidencias";

			modalBodyRow.append(seleccionarVariablesClinicasLabel);
		},
		crearSeleccionarVariablesClinicasComponents(modalBodyRow) {

			const THIZ = this;

			for (let i = 0; i < this.pantalla3.variablesClinicasCoincidentes.length; i++) {

				let variableClinicaCoincidente = this.pantalla3.variablesClinicasCoincidentes[i];

				let foundVariableClinica = this.pantalla3.variablesClinicasSeleccionadas.find(function(obj) {
					return obj.indice === variableClinicaCoincidente.indice && obj.nombreVariable === variableClinicaCoincidente.nombreVariable;
				});

				if (!foundVariableClinica) {

					let seleccionarVariableComponent = document.createElement("div");

					let seleccionarVariablesComponentRectangle = document.createElement("div");

					seleccionarVariableComponent.setAttribute("class", "seleccionar-variables-component");

					seleccionarVariablesComponentRectangle.setAttribute("class", "seleccionar-variables-component-rectangle");

					seleccionarVariableComponent.innerHTML = this.pantalla3.variablesClinicasCoincidentes[i].nombreVariable;

					seleccionarVariableComponent.addEventListener('click', function(event) {

						let nombreVariable = event.target.textContent;

						let indexVariable = THIZ.pantalla3.variablesClinicasCoincidentes.findIndex(variable => variable.nombreVariable === nombreVariable);

						if (indexVariable != -1) {

							if (!THIZ.pantalla3.showSeleccionarVariableButton) {
								THIZ.pantalla3.showSeleccionarVariableButton = true;
							}

							let modalBodyPreseleccionadas = document.getElementById('modalBodyPreseleccionadas');

							THIZ.pantalla3.variablesClinicasPreSeleccionadas.push(THIZ.pantalla3.variablesClinicasCoincidentes[indexVariable]);


							if (modalBodyPreseleccionadas.querySelectorAll(".results-search-label").length == 0) {

								let preseleccionarVariablesClinicasLabel = document.createElement("div");

								preseleccionarVariablesClinicasLabel.setAttribute("class", "results-search-label");

								preseleccionarVariablesClinicasLabel.innerHTML = "Preseleccionadas";

								modalBodyPreseleccionadas.append(preseleccionarVariablesClinicasLabel);
							}

							let preseleccionarVariableComponent = document.createElement("div");

							let preseleccionarVariableComponentRectangle = document.createElement("div");

							preseleccionarVariableComponent.setAttribute("class", "seleccionar-variables-component");

							preseleccionarVariableComponent.setAttribute("style", "color: rgb(39, 90, 224); border: 3px solid rgb(39, 90, 224); box-shadow: 3px 3px 6px 2px rgb(123, 154, 234)");

							preseleccionarVariableComponentRectangle.setAttribute("class", "seleccionar-variables-component-rectangle");

							preseleccionarVariableComponentRectangle.setAttribute("style", "background-color: rgb(39, 90, 224)");

							let preseleccionarVariableComponentI = document.createElement('div');

							preseleccionarVariableComponentI.setAttribute("class", "fa-solid fa-circle-check seleccionar-variables-component-i");

							preseleccionarVariableComponent.innerHTML = THIZ.pantalla3.variablesClinicasCoincidentes[indexVariable].nombreVariable;

							preseleccionarVariableComponent.append(preseleccionarVariableComponentRectangle);

							preseleccionarVariableComponent.append(preseleccionarVariableComponentI);

							modalBodyPreseleccionadas.append(preseleccionarVariableComponent);

							event.target.remove();

							let modalBodyRow = document.getElementById('modalBodyRow');

							if (modalBodyRow.children.length === 1) {
								if (modalBodyRow.querySelectorAll(".results-search-label").length === 1) {
									modalBodyRow.removeChild(modalBodyRow.firstChild);
								}
							}
						}

					});

					seleccionarVariableComponent.append(seleccionarVariablesComponentRectangle);

					modalBodyRow.append(seleccionarVariableComponent);
				}

			}

		},

		buscarVariablesClinicasCoincidentes() {

			const variablesClinicasSeleccionadasJson = JSON.stringify(this.pantalla3.variablesClinicasSeleccionadas);

			const formData = new FormData();

			formData.append('variablesClinicasSeleccionadas', variablesClinicasSeleccionadasJson);

			fetch(window.location.origin + "/admin/fases/buscarVariablesClinicasCoincidentes?nombreVariableClinica=" + this.pantalla3.searchedVariableClinica +
				"&idPrediccionPoblacion=" + this.idPrediccionPoblacion, {
				method: "POST",
				body: formData
			})
				.then(res => res.json())
				.then(res => {

					const THIZ = this;

					let modalBodyRow = document.getElementById("modalBodyRow");

					THIZ.pantalla3.variablesClinicasCoincidentes = [];

					this.resetearModalBody(modalBodyRow);

					if (this.pantalla3.variablesClinicasSeleccionadas.length === this.pantalla3.numVariablesClinicas) {

						this.createNoResultComponent(modalBodyRow, "¡Ya has seleccionado todas las variables!");
					}
					else {
						if (res.length > 0) {

							THIZ.pantalla3.variablesClinicasCoincidentes = res;

							for (let i = 0; i < this.pantalla3.variablesClinicasCoincidentes.length; i++) {

								let variableClinicaCoincidente = this.pantalla3.variablesClinicasCoincidentes[i];

								let variablePreseleccionada = this.pantalla3.variablesClinicasPreSeleccionadas.find(function(obj) {
									return obj.indice === variableClinicaCoincidente.indice && obj.nombreVariable === variableClinicaCoincidente.nombreVariable;
								});

								if (variablePreseleccionada) {
									this.pantalla3.variablesClinicasCoincidentes.splice(i, 1);
									i--;
								}

							}

							if (THIZ.pantalla3.variablesClinicasCoincidentes.length === 0) {
								this.createNoResultComponent(modalBodyRow, "¡No hay ninguna coincidencia!");
							}
							else {
								this.crearSeleccionarVariablesClinicasLabel(modalBodyRow);

								this.crearSeleccionarVariablesClinicasComponents(modalBodyRow);
							}

						}
						else {
							this.createNoResultComponent(modalBodyRow, "¡No hay ninguna coincidencia!");
						}

					}

				})
				.catch(error => console.error(error));

		},
		preseleccionarVariablesClinicas() {

			const THIZ = this;

			for (let i = 0; i < this.pantalla3.variablesClinicasPreSeleccionadas.length; i++) {
				THIZ.pantalla3.variablesClinicasSeleccionadas.push(this.pantalla3.variablesClinicasPreSeleccionadas[i]);
			}

			THIZ.pantalla3.variablesClinicasPreSeleccionadas = [];

			THIZ.pantalla3.seleccionarVariablesClinicasModal.hide();
		},
		seleccionarVariablesClinicas() {

			const THIZ = this;

			this.pantalla3.variablesClinicasSeleccionadas.forEach(function(elemento) {
				THIZ.indicesVariablesClinicasSeleccionadas.push(elemento.indice);
			});

			THIZ.pantalla3.showPantalla = false;

			THIZ.pantalla4.showPantalla = true;
		},
		eliminarVariableSeleccionada(index) {

			const THIZ = this;

			this.pantalla3.variablesClinicasSeleccionadas.splice(index, 1);

		},
		getColorFaseSeleccionada(event) {


			let botonesFases = document.querySelectorAll('.btn-custom-light-color');

			botonesFases.forEach(function(boton) {
				boton.style.backgroundColor = "rgb(123, 151, 234)";
			});

			const boton = event.target;

			boton.style.backgroundColor = 'rgb(65, 105, 225)';

		},
		selectAllVariablesClinicas() {

			fetch(window.location.origin + "/admin/fases/getAllVariablesClinicas?idPrediccionPoblacion=" + this.idPrediccionPoblacion, {
				method: "GET"
			})
				.then(res => res.json())
				.then(res => {

					const THIZ = this;

					THIZ.pantalla3.variablesClinicasSeleccionadas = [];

					THIZ.pantalla3.variablesClinicasSeleccionadas = res;

				})
				.catch(error => console.error(error));

		}
	},


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
			                	
			                		<div class="input-container mt-2">
						                <label for="selectDescripcion" class="input-container-label fw-bold">Seleccione una predicción</label>
										
										<select class="input-container-select" id="selectDescripcion" name="selectDescripcion" v-model="pantalla2.descripcionSeleccionada" required>
				                       		<option class="input-container-select-option" v-for="descripcion in pantalla2.descripciones" :value="descripcion">{{descripcion}}</option>
				                    	</select>
			                    	</div>
				                    	
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
		                   		
			                </form>
			            </div>
		        	</div>
	        	</div>				
			</div>
			
				
			<div v-if="pantalla2.showContinueButton" class="row justify-content-center mt-5">	
					<button type="button" @click="seleccionarPrediccionAndPoblacionInfo" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
			</div>
			
		</div>
		
		
		<div v-if="pantalla3.showPantalla" class="container pt-2">
			
			<button type="button" @click="goBack" class="back-button"><i class="fa-solid fa-arrow-left back-button-i"></i> Atrás</button>	
					
			<div class="row justify-content-around" style="margin-top: 65px;">
				<div class="col-md-6">
					<div class="card rounded-4 p-0 shadow">
			            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
			                <h2 class="text-center text-white">Seleccionar variables clínicas</h2>
			            </div>
			            <div class="card-body">
			            	<div class="row justify-content-around">
			            		<div v-if="this.pantalla3.numVariablesClinicas != this.pantalla3.variablesClinicasSeleccionadas.length" class="col m-2">
					                <button class="btn btn-custom-color fs-5 w-100" @click="showModalSeleccionarVariablesClinicas">
					                	<i class="fa-solid fa-hand-pointer fs-5"></i> Elegir variables</button>
								</div>
								<div v-if="this.pantalla3.numVariablesClinicas != this.pantalla3.variablesClinicasSeleccionadas.length" class="col m-2">
									<button class="btn btn-custom-color fs-5 w-100" @click="selectAllVariablesClinicas">
										<i class="fa-solid fa-list"></i> Seleccionar todas</button>
								</div>
								
								<div v-if="pantalla3.variablesClinicasSeleccionadas.length > 0" id="variablesSeleccionadasContainer" class="variables-seleccionadas-container" style="max-height: 500px; overflow-y: auto;">
									
									<label class="variables-seleccionadas-label">Variables Seleccionadas </label>
								
									<div v-for="(variable, index) in pantalla3.variablesClinicasSeleccionadas" class="variables-seleccionadas-component">
										<div class="variables-seleccionadas-component-text">{{variable.nombreVariable}}</div>
										<i @click="eliminarVariableSeleccionada(index)" class="fa-solid fa-xmark variables-seleccionadas-component-i"></i>
									</div>
								
								</div>
								
								<div class="modal fade" id="seleccionarVariablesClinicasModal" tabindex="-1" aria-hidden="true">
									<div class="modal-dialog modal-dialog-centered">
										<div class="modal-content">
											<div class="modal-header bg-custom-light-color">
												<form class="w-100">
													<div class="search-input-container">
														<input class="search-input" type="text" placeholder="Buscar variable clinica"
															v-model="pantalla3.searchedVariableClinica" @keyup="buscarVariablesClinicasCoincidentes"
															id="seleccionarVariableClinica">
														<i class="search-input-container-i fa-solid fa-magnifying-glass"></i>
													</div>
		
												</form>
											</div>
											<div class="modal-body bg-light">
												<div id="modalBodyRow" class="row justify-content-center overflow-y-auto"
													style="max-height: 500px !important;">
												</div>
												<div id="modalBodyPreseleccionadas" class="row justify-content-center overflow-y-auto"
													style="max-height: 500px !important;">
												</div>
											</div>
											<div v-if="pantalla3.showSeleccionarVariableButton" class="modal-footer justify-content-center">										
												<button @click="preseleccionarVariablesClinicas" class="btn btn-outline-custom-color fs-5 fw-semibold" type="button">Seleccionar</button>
											</div>
										</div>
									</div>
								</div>
							
							</div>
			            </div>
		        	</div>
	        	</div>				
			</div>
			
			<div v-if="pantalla3.variablesClinicasSeleccionadas.length > 0" class="row justify-content-center mt-5">	
					<button type="button" @click="seleccionarVariablesClinicas" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
			</div>
					
		</div>
		
	    
	    <div v-if="pantalla4.showPantalla" class="container pt-2"> 
	    
	    	<button type="button" @click="goBack" class="back-button"><i class="fa-solid fa-arrow-left back-button-i"></i> Atrás</button>	
	    
	    	<div class="row" style="margin-top: 65px;">
	    
			    <div class="col-12 mb-3">
					<h2 class="text-center fw-bold fst-italic text-custom-color fs-1">F<span class="text-custom-light-color">ase</span>s</h2>
				</div>
				
				<ul class="nav nav-pills justify-content-around" id="pills-tab" role="tablist" style="border: 3px solid #7B9AEA; padding-bottom:8px; padding-left:8px; padding-right:8px; border-radius:9px">
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" @click="getColorFaseSeleccionada" ref="fase1" id="fase1" data-bs-toggle="pill" data-bs-target="#nClusters-content" type="button" role="tab" aria-controls="nClusters-content" aria-selected="true" :disabled="!this.csvInput && this.faseSeleccionada!=1">Nº Óptimo de Clusters</button>
				  </li>
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" @click="getColorFaseSeleccionada"  id="fase2" data-bs-toggle="pill" data-bs-target="#subPopulations-content" type="button" role="tab" aria-controls="subPopulations-content" aria-selected="false" :disabled="!this.csvInput && this.faseSeleccionada!=2" selected>Subpoblaciones</button>
				  </li>
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" @click="getColorFaseSeleccionada" id="fase3" data-bs-toggle="pill" data-bs-target="#varianceMetrics-content" type="button" role="tab" aria-controls="varianceMetrics-content" aria-selected="false" :disabled="!this.csvInput && this.faseSeleccionada!=3">Métricas de varianza</button>
				  </li>
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5"  @click="getColorFaseSeleccionada" id="fase4" data-bs-toggle="pill" data-bs-target="#populationProfilesGraphics-content" type="button" role="tab" aria-controls="populationProfilesGraphics-content" aria-selected="false" :disabled="!this.csvInput && this.faseSeleccionada!=4">Gráficas y estadísticas de población</button>
				  </li>
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" @click="getColorFaseSeleccionada" id="fase5" data-bs-toggle="pill" data-bs-target="#modelPerformance-content" type="button" role="tab" aria-controls="modelPerformance-content" aria-selected="false" :disabled="!this.csvInput && this.faseSeleccionada!=5">Rendimiento del modelo</button>
				  </li>
				</ul>
				<div class="tab-content" id="pills-tabContent">
				  <div class="tab-pane fade" id="nClusters-content" role="tabpanel" aria-labelledby="fase1" tabindex="0">
				  	<fase1 v-if="csvInput || faseSeleccionada==1" :idPrediccionPoblacion="this.idPrediccionPoblacion" :csvInput="this.csvInput" :indices="this.indicesVariablesClinicasSeleccionadas" @cambiarFase="cambiarFase"/>
				  </div>
				  <div class="tab-pane fade" id="subPopulations-content" role="tabpanel" aria-labelledby="fase2" tabindex="0">
				  	<fase2 v-if="csvInput || faseSeleccionada==2" :idPrediccionPoblacion="this.idPrediccionPoblacion" :csvInput="this.csvInput" :indices="this.indicesVariablesClinicasSeleccionadas" @cambiarFase="cambiarFase"/>
				  </div>
				  <div class="tab-pane fade" id="varianceMetrics-content" role="tabpanel" aria-labelledby="fase3" tabindex="0">
				  	<fase3 v-if="csvInput || faseSeleccionada==3" :idPrediccionPoblacion="this.idPrediccionPoblacion" :csvInput="this.csvInput" @cambiarFase="cambiarFase"/>
				  </div>
				  <div class="tab-pane fade" id="populationProfilesGraphics-content" role="tabpanel" aria-labelledby="fase4" tabindex="0">
				  	<fase4 v-if="csvInput || faseSeleccionada==4" :idPrediccionPoblacion="this.idPrediccionPoblacion" :csvInput="this.csvInput" :algoritmoOptimo="this.algoritmoOptimoFase3" :indices="this.indicesVariablesClinicasSeleccionadas" @cambiarFase="cambiarFase"/>
				  </div>
				  <div class="tab-pane fade" id="modelPerformance-content" role="tabpanel" aria-labelledby="fase5" tabindex="0">
				  	<fase5 v-if="csvInput || faseSeleccionada==5" :idPrediccionPoblacion="this.idPrediccionPoblacion" :csvInput="this.csvInput" :algoritmoOptimo="this.algoritmoOptimoFase3" :indices="this.indicesVariablesClinicasSeleccionadas" />
				  </div>
				</div>
			
			</div>
			
		</div>
				
	</div>
	`
})