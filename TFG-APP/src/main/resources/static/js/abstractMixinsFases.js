
export const mixinFase1 = {
	data: function() {
		return {
			maxClusters: '',
			imagenCreada: false,
			imagenUrl: '',
			mostrarCargando: false,
			errorMessage: ''
		}
	}
};

export const mixinFase2 = {
	data: function() {
		return {
			rutaAlgoritmosObligatorios: '',
			rutaAlgoritmosCoincidentes: '',
			mostrarCargando: false,
			searchedAlgoritmo: '',
			modalAddAlgoritmos: '',
			algoritmosCoincidentes: [],
			algoritmosPreSeleccionados: [],
			algoritmosSeleccionados: [],
			errorMessage: ''
		}
	},
	methods: {

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
		getAlgoritmosObligatorios() {

			const THIZ = this;

			THIZ.algoritmosSeleccionados = [];

			fetch(window.location.origin + this.rutaAlgoritmosObligatorios, {
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
		buscarAlgoritmosCoincidentes() {

			const formData = new FormData();

			const algoritmosSeleccionadosJson = JSON.stringify(this.algoritmosSeleccionados);

			formData.append('algoritmosSeleccionados', algoritmosSeleccionadosJson);

			const algoritmosPreSeleccionadosJson = JSON.stringify(this.algoritmosPreSeleccionados);

			formData.append('algoritmosPreSeleccionados', algoritmosPreSeleccionadosJson);

			fetch(window.location.origin + this.rutaAlgoritmosCoincidentes + this.searchedAlgoritmo, {
				method: "POST",
				body: formData
			})
				.then(res => res.json())
				.then(res => {

					const THIZ = this;

					let algoritmosCoincidentesRow = document.getElementById("algoritmosCoincidentesRow");					

					this.resetearModalBodyRow(algoritmosCoincidentesRow);
					
					THIZ.algoritmosCoincidentes = [];

					if (res.length > 0) {

						for (let i = 0; i < res.length; i++) {

							let algoritmo = {};

							algoritmo["nombreAlgoritmo"] = res[i].nombreAlgoritmo;

							algoritmo["nClusters"] = '';

							THIZ.algoritmosCoincidentes.push(algoritmo);

						}

						this.crearAlgoritmosCoincidentesRowComponents(algoritmosCoincidentesRow, res);
					}
					else {
						this.createNoResultComponent(algoritmosCoincidentesRow, "¡No hay ninguna coincidencia!");
					}

				})
				.catch(error => console.error(error));
		}
	}
};

export const mixinFase3 = {
	data: function() {
		return {
			lista: [],
			headers: [{ header: "Metric", pos: 0 }, { header: "Tss_value", pos: 1 }, { header: "Total_wc", pos: 2 }, { header: "Total_bc", pos: 3 }],
			datosCargados: false,
			mostrarCargando: false,
			errorMessage: ''
		}
	}
};

export const mixinFase4 = {
	data: function() {
		return {
			curvasAndPerfilesCreados: false,
			nClusters: '',
			clusterSeleccionadoCurves: '',
			clusterSeleccionadoProfile: '',
			curvasUrl: '',
			nombreDescargaCurvas: '',
			curvasCargadas: false,
			perfilCargado: false,
			errorMessage1: '',
			errorMessage2: '',
			errorMessage3: '',
			mostrarCargando: false,
			datasetStatistics: [
				{ nombre: 'Id Prediction', valor: '' },
				{ nombre: 'Number of variables', valor: '' },
				{ nombre: 'Number of observations', valor: '' },
				{ nombre: 'Target median', valor: '' },
				{ nombre: 'Target third quantile', valor: '' },
			],
			variableSeleccionada: '',
			variables: []
		}
	},
	computed: {
		nClustersRange() {
			return Array.from({ length: this.nClusters }, (_, index) => index);
		}
	},
	methods: {
		mostrarClusterSurvivalCurve: function(secuencial, idPrediccion) {
			const THIZ = this;
			THIZ.mostrarCargando = true;
			THIZ.curvasCargadas = false;
			THIZ.errorMessage2 = '';
			var url;

			if (secuencial) url = "/admin/procesamientos/secuencial/getRutaCluster?clusterNumber=" + this.clusterSeleccionadoCurves;
			else url = "/admin/procesamientos/noSecuencial/getRutaCluster?clusterNumber=" + this.clusterSeleccionadoCurves + "&idPrediccion=" + idPrediccion;

			fetch(window.location.origin + url, {
				method: "GET",
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.errorMessage2 = errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.text();
				})
				.then(data => {
					THIZ.curvasUrl = data;
					THIZ.nombreDescargaCurvas = 'cluster' + this.clusterSeleccionadoCurves + '.png';
					THIZ.curvasCargadas = true;
					THIZ.mostrarCargando = false;
				})
				.catch(error => console.error(error));
		},

		mostrarClusterProfile: function(secuencial, idPrediccion) {
			const THIZ = this;
			THIZ.mostrarCargando = true;
			THIZ.errorMessage3 = '';
			THIZ.perfilCargado = false;
			var url;

			if (secuencial) url = "/admin/procesamientos/secuencial/getClusterProfile?clusterNumber=" + this.clusterSeleccionadoProfile;
			else url = "/admin/procesamientos/noSecuencial/getClusterProfile?clusterNumber=" + this.clusterSeleccionadoProfile + "&idPrediccion=" + idPrediccion;

			fetch(window.location.origin + url, {
				method: "GET",
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.errorMessage3 = errorMessage;
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
		}
	},

};

export const mixinFase5 = {
	data: function() {
		return {
			datosCargados: false,
			auc: '',
			mostrarCargando: false,
			errorMessage: ''
		}
	}

};