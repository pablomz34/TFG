new Vue({
	el: "#predicciones",
	data: function() {
		return {
			errorSearchDescripcion: '',
			searchedDescripcion: '',
			crearPrediccionDescripcion: '',
			prediccionesCoincidentes: [],
			idEliminarPrediccion: '',
			prediccionCreadaCorrectamenteMessage: '',
			prediccionCreadaErrorMessage: '',
			prediccionEliminadaErrorMessage: '',
			prediccionEliminadaCorrectamenteMessage: '',
			crearPrediccionModal: '',
			eliminarPrediccionModal: ''
		}
	},

	methods: {


		showToastCrearPrediccion() {

			const THIZ = this;

			if (THIZ.crearPrediccionModal.length === 0) {
				let modal = new bootstrap.Modal(document.getElementById('crearPrediccionModal'));

				THIZ.crearPrediccionModal = modal;

				THIZ.crearPrediccionModal.show();
			}
			else {

				this.resetearModalCrearPrediccion();

				THIZ.crearPrediccionModal.show();
			}
		},
		hideCrearPrediccionModal() {

			const THIZ = this;

			THIZ.crearPrediccionModal.hide();

		},
		showToastEliminarPrediccion() {

			const THIZ = this;

			if (THIZ.eliminarPrediccionModal.length === 0) {

				let modal = new bootstrap.Modal(document.getElementById('eliminarPrediccionModal'));

				THIZ.eliminarPrediccionModal = modal;

				THIZ.eliminarPrediccionModal.show();
			}
			else {

				this.resetearModalEliminarPrediccion();

				THIZ.eliminarPrediccionModal.show();
			}
		},

		crearPrediccion() {
			const THIZ = this;

			fetch(window.location.origin + "/admin/fases/createOrUpdatePrediction?crearPrediccion=" + true +
				"&descripcion=" + this.crearPrediccionDescripcion, {
				method: "POST",
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.prediccionCreadaErrorMessage = errorMessage;
						THIZ.crearPrediccionModal.hide();
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.text();
				})
				.then(data => {
					THIZ.prediccionCreadaCorrectamenteMessage = 'La predicción se ha creado correctamente';
					THIZ.crearPrediccionModal.hide();
				})
				.catch(error => console.error(error));
		},

		buscarPredicciones() {

			fetch(window.location.origin + "/admin/buscarPrediccionesCoincidentes?searchedDescripcion=" + encodeURIComponent(this.searchedDescripcion), {
				method: "GET"
			})
				.then(async res => {
					if (!res.ok) {
						const errorMessage = await res.text();
						THIZ.errorSearchDescripcion = errorMessage;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.json();
				})
				.then(res => {

					const THIZ = this;

					let modalBodyRow = document.getElementById("modalBodyRow");

					THIZ.prediccionesCoincidentes = [];

					this.resetearModalBody();

					if (res.length > 0) {

						THIZ.prediccionesCoincidentes = res;

						this.crearEliminarPrediccionLabel(modalBodyRow);

						this.crearEliminarPrediccionComponents(modalBodyRow);

					}
					else {
						this.createNoResultComponent(modalBodyRow);
					}

				})
				.catch(error => console.log(error))


		},

		crearEliminarPrediccionLabel(modalBodyRow) {
			let eliminarPrediccionLabel = document.createElement("div");

			eliminarPrediccionLabel.setAttribute("class", "results-search-label");

			eliminarPrediccionLabel.innerHTML = "Coincidencias";

			modalBodyRow.append(eliminarPrediccionLabel);
		},
		crearEliminarPrediccionComponents(modalBodyRow) {

			const THIZ = this;

			for (let i = 0; i < this.prediccionesCoincidentes.length; i++) {

				let eliminarPrediccionContainer = document.createElement("div");

				let eliminarPrediccionComponent = document.createElement("div");

				let eliminarPrediccionIcon = document.createElement("i");

				eliminarPrediccionContainer.setAttribute("class", "results-search-component-container");

				eliminarPrediccionComponent.setAttribute("class", "results-search-component");

				eliminarPrediccionIcon.setAttribute("class", "results-search-component-i fa-solid fa-trash");

				eliminarPrediccionIcon.addEventListener("click", function(event) {

					let icon = event.target;

					let container = icon.parentNode;

					let modalBodyRow = document.getElementById("modalBodyRow");

					let hijos = modalBodyRow.children;

					let indice = Array.prototype.indexOf.call(hijos, container);

					THIZ.idEliminarPrediccion = THIZ.prediccionesCoincidentes[indice - 1].id;

					let toast = new bootstrap.Toast(document.getElementById('eliminarPrediccionToast'));

					toast.show();
				});

				eliminarPrediccionComponent.innerHTML = this.prediccionesCoincidentes[i].descripcion;

				eliminarPrediccionContainer.append(eliminarPrediccionComponent);

				eliminarPrediccionContainer.append(eliminarPrediccionIcon);

				modalBodyRow.append(eliminarPrediccionContainer);

			}

		},
		createNoResultComponent(modalBodyRow) {
			let noResultsComponent = document.createElement("div");

			noResultsComponent.setAttribute("class", "noResults-component");

			noResultsComponent.innerHTML = "¡No hay ninguna coincidencia!";

			modalBodyRow.append(noResultsComponent);
		},

		resetearModalCrearPrediccion() {
			const THIZ = this;

			THIZ.crearPrediccionDescripcion = '';

			THIZ.prediccionCreadaCorrectamenteMessage = '';

			THIZ.prediccionCreadaErrorMessage = '';

		},
		resetearModalBody() {
			let modalBodyRow = document.getElementById("modalBodyRow");

			while (modalBodyRow.firstChild) {
				modalBodyRow.removeChild(modalBodyRow.firstChild);
			}
		},
		resetearModalEliminarPrediccion() {

			const THIZ = this;

			THIZ.prediccionesCoincidentes = [];

			THIZ.idEliminarPrediccion = '';

			THIZ.prediccionEliminadaErrorMessage = '',

			THIZ.prediccionEliminadaCorrectamenteMessage = '';

			THIZ.errorSearchDescripcion = '';

			THIZ.searchedDescripcion = '';

			this.resetearModalBody();

			this.createNoResultComponent(modalBodyRow);

		},
		eliminarPrediccion() {

			const THIZ = this;

			fetch(window.location.origin + "/admin/borrarPrediccion?idPrediccion=" + encodeURIComponent(this.idEliminarPrediccion), {
				method: "POST"
			})
				.then(async res => {
					if (!res.ok) {
						const errorMessage = await res.text();
						
						THIZ.prediccionEliminadaErrorMessage = errorMessage;
						
						let toast = new bootstrap.Toast(document.getElementById('eliminarPrediccionToast'));
						
						toast.hide();
						
						THIZ.eliminarPrediccionModal.hide();
						
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.text();
				})
				.then(res => {

					THIZ.prediccionEliminadaCorrectamenteMessage = res;

					let toast = new bootstrap.Toast(document.getElementById('eliminarPrediccionToast'));

					toast.hide();

					THIZ.eliminarPrediccionModal.hide();
				})
				.catch(error => console.log(error))
		}
	},


})