Vue.component('fase1', {
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
			formData.append('file', this.$refs.csvFile.files[0]);
			THIZ.error = '';
			
			fetch(window.location.origin + "/admin/procesamientos/noSecuencial/getOptimalNClusters", {
				method: "POST",
				body: formData
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error = errorMessage;
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
				.catch(error => console.error(error))
		},
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
	                    <div class="form-group mb-3">
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
	</div>
	`
});

Vue.component('fase2', {
	data: function() {
		return {
			nClustersAglomerativo: '',
			nClustersKModes: '',
			csvFile: '',
			error: '',
			mostrarCargando: false,
			searchedAlgoritmo: '',
			modalAddAlgoritmos: '',
			algoritmosCoincidentes: [],
			algoritmosPreSeleccionados: [],
			algoritmosSeleccionados: []
		}
	},
	
	created() {
		this.getAlgoritmosObligatorios();
	},

	methods: {
		getSubPopulations: function() {
			const THIZ = this;			
			THIZ.mostrarCargando = true;		
			THIZ.error = '';
			const formData = new FormData();
			const algoritmosSeleccionadosJson = JSON.stringify(this.algoritmosSeleccionados);
			formData.append('algoritmos', algoritmosSeleccionadosJson);
			formData.append('file', this.$refs.csvFile.files[0]);

			fetch(window.location.origin + "/admin/procesamientos/noSecuencial/getSubPopulations", {
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
						THIZ.error = errorMessage;
						THIZ.mostrarCargando = false;
						this.getAlgoritmosObligatorios();
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
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					THIZ.mostrarCargando = false;
				})
				.catch(error => console.error(error));
		},

		getAlgoritmosObligatorios() {
			const THIZ = this;
			THIZ.algoritmosSeleccionados = [];
			
			fetch(window.location.origin + "/admin/procesamientos/noSecuencial/getAlgoritmosObligatorios", {
				method: "GET"
			})
				.then(res => res.json())
				.then(res => {
					for (let i = 0; i < res.length; i++) {
						let algoritmoObligatorio = {};
						algoritmoObligatorio["nombreAlgoritmo"] = res[i].nombreAlgoritmo;
						algoritmoObligatorio["nClusters"] = '';
						THIZ.algoritmosSeleccionados.push(algoritmoObligatorio);
					}
				})
				.catch(error => console.error(error));
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

			fetch(window.location.origin + "/admin/procesamientos/noSecuencial/buscarAlgoritmosCoincidentes?nombreAlgoritmo=" + this.searchedAlgoritmo, {
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
		                        <input type="number" min="2" max="20" class="input-container-input pe-1" v-model="algoritmo.nClusters" :id="'nClusters' + algoritmo.nombreAlgoritmo" required />
	                    	</div>
	                    </div>	                    
	                    <div v-if="algoritmosSeleccionados.length > 2" v-for="(algoritmo, index) in algoritmosSeleccionados.slice(2)" class="form-group mb-3">
	                    	<div class="input-container">
		                        <label class="input-container-label fw-bold" :for="'nClusters' + algoritmo.nombreAlgoritmo">Nº de clusters del algoritmo {{algoritmo.nombreAlgoritmo}}</label>
		                       	<input type="number" min="2" max="20" class="input-container-input pe-1" v-model="algoritmo.nClusters" :id="'nClusters' + algoritmo.nombreAlgoritmo" required />	
	                    		<i @click="deseleccionarAlgoritmo(index + 2)" class="fa-solid fa-xmark input-container-borrar-algoritmo-i"></i>
	                    	</div>
	                    </div>	
	                    <div class="form-group mb-3">
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
	</div>
	`
});

Vue.component('fase3', {
	data: function() {
		return {
			lista: [],
			headers: [{ header: "Metric", pos: 0 }, { header: "Tss_value", pos: 1 }, { header: "Total_wc", pos: 2 }, { header: "Total_bc", pos: 3 }],
			datosCargados: false,
			error: '',
			mostrarCargando: false,
		}
	},

	methods: {
		getVarianceMetrics: function() {
			const THIZ = this;
			THIZ.error = '';
			const formData = new FormData();
			THIZ.mostrarCargando = true;
			formData.append('file', this.$refs.csvFile.files[0]);

			fetch(window.location.origin + "/admin/procesamientos/noSecuencial/getVarianceMetrics", {
				method: "POST",
				body: formData
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error = errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.json();

				})
				.then(data => {
					for (i = 0, j = 1; j < data.length; i++, j++) THIZ.lista[i] = data[j];
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
	                    <div class="form-group mb-3">
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
	</div>
	`
});

Vue.component('fase4', {
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
			
			fetch(window.location.origin + "/admin/procesamientos/noSecuencial/getDescripcionesPredicciones", {
				method: "GET",
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error1 = errorMessage;
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
			fetch(window.location.origin + "/admin/procesamientos/noSecuencial/createOrUpdatePrediction?crearPrediccion=" + this.crear +
				"&descripcion=" + this.descripcionSeleccionada, {
				method: "POST",
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error0 = errorMessage;
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
			formData.append('idPrediccionPoblacion', THIZ.idPrediccion);
			formData.append('file', this.$refs.csvFile.files[0]);

			fetch(window.location.origin + "/admin/procesamientos/noSecuencial/createPopulationAndCurves", {
				method: "POST",
				body: formData
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error1 = errorMessage;
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
	
			fetch(window.location.origin + "/admin/procesamientos/noSecuencial/getRutaCluster?clusterNumber=" + this.clusterSeleccionadoCurves + "&idPrediccion=" + this.idPrediccion, {
				method: "GET",
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error2 = errorMessage;
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

			fetch(window.location.origin + "/admin/procesamientos/noSecuencial/getClusterProfile?clusterNumber=" + this.clusterSeleccionadoProfile + "&idPrediccion=" + this.idPrediccion, {
				method: "GET",
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error3 = errorMessage;
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
			<div class="card col-7 rounded-4 p-0 mb-3 shadow">
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
	    <div v-if="continuar" class="row justify-content-around">
	        <div class="card col-7 rounded-4 p-0 mb-3 shadow">
	            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Crear curvas de supervivencia y perfil de población</h2>
	            </div>
	            <div class="card-body">
	                <form @submit.prevent="createPopulationAndCurves">
	                    <div class="form-group mb-3">
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
			const formData = new FormData();			
			THIZ.datosCargados = false;
			THIZ.error = '';
			THIZ.mostrarCargando = true;
			formData.append('file', this.$refs.csvFile.files[0]);
			
			fetch(window.location.origin + "/admin/procesamientos/noSecuencial/getModelPerformance", {
				method: "POST",
				body: formData
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error = errorMessage;
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
	            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Rendimiento del modelo</h2>
	            </div>	      
	            <div class="card-body">
	                <form @submit.prevent="getModelPerformance">
	                    <div class="form-group mb-3">
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

new Vue({
	el: "#noSecuencialFases",
	data: function() {
		return {
			idPrediccionPoblacion: '',
			indicesVariablesClinicasSeleccionadas: [],
			showPantalla: true,
			faseSeleccionada: 1,
			algoritmoOptimoFase3: ''
		}
	},

	methods: {
		cambiarFase(fase) {
			const THIZ = this;
			switch (fase) {
				case 1:
					THIZ.faseSeleccionada = fase;
					break;
				case 2:
					THIZ.faseSeleccionada = fase;
					break
				case 3:
					THIZ.faseSeleccionada = fase;
					break;
				case 4:
					THIZ.faseSeleccionada = fase;
					break;
				case 5:
					THIZ.faseSeleccionada = fase;
					break;
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

		getColorFaseSeleccionada(event) {
			let botonesFases = document.querySelectorAll('.btn-custom-light-color');
			botonesFases.forEach(function(boton) {
				boton.style.backgroundColor = "rgb(123, 151, 234)";
			});
			const boton = event.target;
			boton.style.backgroundColor = 'rgb(65, 105, 225)';
		},
	},

	template: `
	<div class="container-fluid pt-2 position-relative">		
		<div v-if="showPantalla" class="container pt-2"> 	    	    	    
	    	<div class="row" style="margin-top: 65px;">	    
			    <div class="col-12 mb-3">
					<h2 class="text-center fw-bold fst-italic text-custom-color fs-1">F<span class="text-custom-light-color">ase</span>s</h2>
				</div>				
				<ul class="nav nav-pills justify-content-around" id="pills-tab" role="tablist" style="border: 3px solid #7B9AEA; padding-bottom:8px; padding-left:8px; padding-right:8px; border-radius:9px">
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" @click="getColorFaseSeleccionada; cambiarFase(1)" id="fase1" data-bs-toggle="pill" data-bs-target="#nClusters-content" type="button" role="tab" aria-controls="nClusters-content" aria-selected="true">Nº Óptimo de Clusters</button>
				  </li>
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" @click="getColorFaseSeleccionada; cambiarFase(2)" id="fase2" data-bs-toggle="pill" data-bs-target="#subPopulations-content" type="button" role="tab" aria-controls="subPopulations-content" aria-selected="false" selected>Subpoblaciones</button>
				  </li>
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" @click="getColorFaseSeleccionada; cambiarFase(3)" id="fase3" data-bs-toggle="pill" data-bs-target="#varianceMetrics-content" type="button" role="tab" aria-controls="varianceMetrics-content" aria-selected="false">Métricas de varianza</button>
				  </li>
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" @click="getColorFaseSeleccionada; cambiarFase(4)" id="fase4" data-bs-toggle="pill" data-bs-target="#populationProfilesGraphics-content" type="button" role="tab" aria-controls="populationProfilesGraphics-content" aria-selected="false">Gráficas y estadísticas de población</button>
				  </li>
				  <li class="nav-item pt-2" role="presentation">
				    <button class="btn btn-custom-light-color w-100 text-white fw-bold fs-5" @click="getColorFaseSeleccionada; cambiarFase(5)" id="fase5" data-bs-toggle="pill" data-bs-target="#modelPerformance-content" type="button" role="tab" aria-controls="modelPerformance-content" aria-selected="false">Rendimiento del modelo</button>
				  </li>
				</ul>
				<div class="tab-content" id="pills-tabContent">
				  <div class="tab-pane fade" id="nClusters-content" role="tabpanel" aria-labelledby="fase1" tabindex="0">
				  	<fase1 v-if="faseSeleccionada==1"/>
				  </div>
				  <div class="tab-pane fade" id="subPopulations-content" role="tabpanel" aria-labelledby="fase2" tabindex="0">
				  	<fase2 v-if="faseSeleccionada==2"/>
				  </div>
				  <div class="tab-pane fade" id="varianceMetrics-content" role="tabpanel" aria-labelledby="fase3" tabindex="0">
				  	<fase3 v-if="faseSeleccionada==3"/>
				  </div>
				  <div class="tab-pane fade" id="populationProfilesGraphics-content" role="tabpanel" aria-labelledby="fase4" tabindex="0">
				  	<fase4 v-if="faseSeleccionada==4"/>
				  </div>
				  <div class="tab-pane fade" id="modelPerformance-content" role="tabpanel" aria-labelledby="fase5" tabindex="0">
				  	<fase5 v-if="faseSeleccionada==5"/>
				  </div>
				</div>			
			</div>			
		</div>				
	</div>
	`
})