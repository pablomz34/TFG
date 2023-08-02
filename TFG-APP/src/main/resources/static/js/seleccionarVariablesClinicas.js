new Vue({
	el: "#seleccionarVariablesClinicas",
	data: function() {
		return {
			maxVariablesClinicas: '',
			searchedVariableClinica: '',
			variablesClinicasSeleccionadas: [],
			variablesClinicasPreSeleccionadas: [],
			variablesClinicasCoincidentes: [],
			seleccionarVariablesClinicasModal: '',
			showSeleccionarVariableButton: false,
			errorMessage: ''
		}
	},

	mounted() {
		fetch(window.location.origin + "/admin/procesamientoSecuencial/getMaximoVariablesClinicas", {
			method: "GET",
		})
			.then(res => res.text())
			.then(maxVariablesClinicas => {

				const THIZ = this;
				
				THIZ.maxVariablesClinicas = Number(maxVariablesClinicas);

			})
			.catch(error => console.error(error));
	},
	methods: {
		showModalSeleccionarVariablesClinicas() {

			const THIZ = this;

			if (this.seleccionarVariablesClinicasModal.length === 0) {
				let modal = new bootstrap.Modal(document.getElementById('seleccionarVariablesClinicasModal'));

				THIZ.seleccionarVariablesClinicasModal = modal;
			}

			this.iniciarModalSeleccionarVariablesClinicas();

			THIZ.seleccionarVariablesClinicasModal.show();

		},
		iniciarModalSeleccionarVariablesClinicas() {

			const THIZ = this;

			THIZ.searchedVariableClinica = '';

			THIZ.showSeleccionarVariableButton = false;

			let modalBodyRow = document.getElementById('modalBodyRow');

			let modalBodyPreseleccionadas = document.getElementById('modalBodyPreseleccionadas');

			this.resetearModalBody(modalBodyRow);

			this.resetearModalBobyPreseleccionadas(modalBodyPreseleccionadas);

			if (this.variablesClinicasSeleccionadas.length === this.maxVariablesClinicas) {
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

			for (let i = 0; i < this.variablesClinicasCoincidentes.length; i++) {

				let variableClinicaCoincidente = this.variablesClinicasCoincidentes[i];

				let foundVariableClinica = this.variablesClinicasSeleccionadas.find((variable) => variable === variableClinicaCoincidente);

				if (!foundVariableClinica) {

					let seleccionarVariableComponent = document.createElement("div");

					let seleccionarVariablesComponentRectangle = document.createElement("div");

					seleccionarVariableComponent.setAttribute("class", "seleccionar-variables-component");

					seleccionarVariablesComponentRectangle.setAttribute("class", "seleccionar-variables-component-rectangle");

					seleccionarVariableComponent.innerHTML = this.variablesClinicasCoincidentes[i];

					seleccionarVariableComponent.addEventListener('click', function(event) {

						let nombreVariable = event.target.textContent;

						let indexVariable = THIZ.variablesClinicasCoincidentes.findIndex((variable) => variable === nombreVariable);

						if (indexVariable != -1) {

							if (!THIZ.showSeleccionarVariableButton) {
								THIZ.showSeleccionarVariableButton = true;
							}

							let modalBodyPreseleccionadas = document.getElementById('modalBodyPreseleccionadas');

							THIZ.variablesClinicasPreSeleccionadas.push(THIZ.variablesClinicasCoincidentes[indexVariable]);


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

							preseleccionarVariableComponent.innerHTML = THIZ.variablesClinicasCoincidentes[indexVariable];

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

			fetch(window.location.origin + "/admin/procesamientoSecuencial/buscarVariablesClinicasCoincidentes?nombreVariableClinica=" + this.searchedVariableClinica, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(this.variablesClinicasSeleccionadas)
			})
				.then(res => res.json())
				.then(res => {

					const THIZ = this;

					let modalBodyRow = document.getElementById("modalBodyRow");

					THIZ.variablesClinicasCoincidentes = [];

					this.resetearModalBody(modalBodyRow);

					if (this.variablesClinicasSeleccionadas.length === this.maxVariablesClinicas) {

						this.createNoResultComponent(modalBodyRow, "¡Ya has seleccionado todas las variables!");
					}
					else {
						if (res.length > 0) {

							THIZ.variablesClinicasCoincidentes = res;

							for (let i = 0; i < this.variablesClinicasCoincidentes.length; i++) {

								let variableClinicaCoincidente = this.variablesClinicasCoincidentes[i];

								let variablePreseleccionada = this.variablesClinicasPreSeleccionadas.find((variable) => variable === variableClinicaCoincidente);

								if (variablePreseleccionada) {
									this.variablesClinicasCoincidentes.splice(i, 1);
									i--;
								}

							}

							if (THIZ.variablesClinicasCoincidentes.length === 0) {
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

			for (let i = 0; i < this.variablesClinicasPreSeleccionadas.length; i++) {
				THIZ.variablesClinicasSeleccionadas.push(this.variablesClinicasPreSeleccionadas[i]);
			}

			THIZ.variablesClinicasPreSeleccionadas = [];

			THIZ.seleccionarVariablesClinicasModal.hide();
		},
		seleccionarVariablesClinicas() {

			const THIZ = this;
		
			THIZ.errorMessage = '';

			fetch(window.location.origin + "/admin/procesamientoSecuencial/procesarVariablesClinicasSeleccionadas", {
				method: "POST",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(this.variablesClinicasSeleccionadas)
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();

						THIZ.errorMessage = errorMessage;

						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.text();
				})
				.then(nextUrl => {

					window.location.href = nextUrl;

				})
				.catch(error => console.error(error));
			

		},
		selectAllVariablesClinicas() {

			fetch(window.location.origin + "/admin/procesamientoSecuencial/getAllVariablesClinicas", {
				method: "GET"
			})
				.then(res => res.json())
				.then(res => {

					const THIZ = this;

					THIZ.variablesClinicasSeleccionadas = [];

					THIZ.variablesClinicasSeleccionadas = res;

				})
				.catch(error => console.error(error));

		},
		eliminarVariableSeleccionada(index) {

			const THIZ = this;

			THIZ.variablesClinicasSeleccionadas.splice(index, 1);

		}
	},
	template: `
		<div class="container-fluid pt-2">
		
			<div class="row justify-content-center mt-3">
				<div v-if="errorMessage != ''" class="col-md-5">
					<div class="alert alert-danger alert-dismissible fade show" role="alert">
						{{errorMessage}}
						<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
					</div>
				</div>
			</div>
		
			<div class="row justify-content-around" style="margin-top: 50px;">
			
				<div class="col-md-6">
					<div class="card rounded-4 p-0 shadow">
			            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
			                <h2 class="text-center text-white">Seleccionar variables clínicas</h2>
			            </div>
			            <div class="card-body">
			            
			            	<div class="row justify-content-around">
			            		<div v-if="maxVariablesClinicas != variablesClinicasSeleccionadas.length" class="col m-2">
					                <button class="btn btn-custom-color fs-5 w-100" @click="showModalSeleccionarVariablesClinicas">
					                	<i class="fa-solid fa-hand-pointer fs-5"></i> Elegir variables</button>
								</div>
								<div v-if="maxVariablesClinicas != variablesClinicasSeleccionadas.length" class="col m-2">
									<button class="btn btn-custom-color fs-5 w-100" @click="selectAllVariablesClinicas">
										<i class="fa-solid fa-list"></i> Seleccionar todas</button>
								</div>
								
								<div v-if="variablesClinicasSeleccionadas.length > 0" id="variablesSeleccionadasContainer" class="variables-seleccionadas-container" style="max-height: 500px; overflow-y: auto;">
									
									<label class="variables-seleccionadas-label">Variables Seleccionadas </label>
								
									<div v-for="(variable, index) in variablesClinicasSeleccionadas" class="variables-seleccionadas-component">
										<div class="variables-seleccionadas-component-text">{{variable}}</div>
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
															v-model="searchedVariableClinica" @keyup="buscarVariablesClinicasCoincidentes"
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
											<div v-if="showSeleccionarVariableButton" class="modal-footer justify-content-center">										
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
			
			<div v-if="variablesClinicasSeleccionadas.length > 0" class="row justify-content-center mt-5">	
					<button type="button" @click="seleccionarVariablesClinicas" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
			</div>
			
			
		</div>
	`
})