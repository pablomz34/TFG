
new Vue({
	el: "#procesamientoSecuencialFase2",
	data: function() {
		return {
			mostrarCargando: false,
			searchedAlgoritmo: '',
			modalAddAlgoritmos: '',
			algoritmosCoincidentes: [],
			algoritmosPreSeleccionados: [],
			algoritmosSeleccionados: [],
			continueButton: false,
			errorMessage: '',
		}
	},
	mounted() {

		this.getAlgoritmosObligatorios();
	},
	methods: {
		getSubPopulations: function() {

			const THIZ = this;

			THIZ.mostrarCargando = true;

			THIZ.errorMessage = '';

			fetch(window.location.origin + "/admin/procesamientoSecuencial/getSubPopulations", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Accept": "text/csv"
				},
				body: JSON.stringify(this.algoritmosSeleccionados)
			})
				.then(async res => {
					// Verificar si la respuesta es OK
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.errorMessage = errorMessage;
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

					// Agregar el enlace al DOM y hacer clic en él para descargar el archivo
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					THIZ.continueButton = true;
					THIZ.mostrarCargando = false;

				})
				.catch(error => console.error(error));
		},

		getAlgoritmosObligatorios() {

			const THIZ = this;

			THIZ.algoritmosSeleccionados = [];

			fetch(window.location.origin + "/admin/procesamientoSecuencial/getAlgoritmosObligatorios", {
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

			fetch(window.location.origin + "/admin/procesamientoSecuencial/buscarAlgoritmosCoincidentes?nombreAlgoritmo=" + this.searchedAlgoritmo, {
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
		},
		siguienteFase() {

			const THIZ = this;
			
			THIZ.errorMessage = '';

			fetch(window.location.origin + "/admin/procesamientoSecuencial/siguienteFase", {
				method: "POST"
			})
				.then(async res => {

					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.errorMessage = errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.text();

				})
				.then(nextUrl => {

					window.location.href = nextUrl;

				})
				.catch(error => console.error(error))

		}
	},
	template: `
		<div class="container mb-5 mt-5">
		    <span>
		        <div id="cargando" v-show="mostrarCargando" style="position: fixed; display: none; width: 100%; height: 100%; margin: 0; padding: 0; top: 0; left: 0; background: rgba(255, 255, 255, 0.75); z-index: 9999;">
		            <img id="cargando" src="/images/cargando.gif" style="top: 50%; left: 50%; position: fixed; transform: translate(-50%, -50%); z-index: 9999;"/>
		        </div>
		    </span>
		    
		    <div class="row justify-content-center mt-3">
				<div v-if="errorMessage != ''" class="col-md-5">
					<div class="alert alert-danger alert-dismissible fade show" role="alert">
						{{errorMessage}}
						<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
					</div>
				</div>
			</div>
		
		    <div class="row col-md-6 offset-md-3">
		        
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
		    <div v-if="continueButton" class="row justify-content-center m-2">	
				<button type="button" @click="siguienteFase" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
			</div>
		</div>
	`
})