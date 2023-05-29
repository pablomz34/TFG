new Vue({
	el: "#predicciones",
	data: function() {
		return {
			errorSearchDescripcion: '',
			searchedDescripcion: '',
			prediccionesCoincidentes: [],
			idEliminarPrediccion: '',
			prediccionEliminadaErrorMessage: '',
			prediccionEliminadaCorrectamenteMessage: '',
			eliminarPrediccionModal: ''
		}
	},

	methods: {

		buscarPredicciones() {


			fetch(window.location.origin + "/admin/buscarPrediccionesCoincidentes?searchedDescripcion=" + encodeURIComponent(this.searchedDescripcion), {
				method: "GET"
			})
				.then(async res => {
					if (!res.ok) {
						const errorMessage = await res.text();
						THIZ.errorSearchDescripcion = "Error: " + errorMessage;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.json();
				})
				.then(res => {

					const THIZ = this;

					let modalBodyRow = document.getElementById("modalBodyRow");

					this.resetearModalBody(false);

					if (res.length > 0) {

						THIZ.prediccionesCoincidentes = res;

						this.crearEliminarPrediccionLabel(modalBodyRow);

						this.creareliminarPrediccionComponents(modalBodyRow);

					}
					else {
						this.createNoResultComponent(modalBodyRow);
					}


				})
				.catch(error => console.log(error))


		},

		crearEliminarPrediccionLabel(modalBodyRow) {
			let eliminarPrediccionLabel = document.createElement("div");

			eliminarPrediccionLabel.setAttribute("class", "eliminar-prediccion-label");

			eliminarPrediccionLabel.innerHTML = "Coincidencias";

			modalBodyRow.append(eliminarPrediccionLabel);
		},
		creareliminarPrediccionComponents(modalBodyRow) {

			const THIZ = this;

			for (let i = 0; i < this.prediccionesCoincidentes.length; i++) {

				let eliminarPrediccionContainer = document.createElement("div");

				let eliminarPrediccionComponent = document.createElement("div");

				let eliminarPrediccionIcon = document.createElement("i");

				eliminarPrediccionContainer.setAttribute("class", "eliminar-prediccion-component-container");

				eliminarPrediccionComponent.setAttribute("class", "eliminar-prediccion-component");

				eliminarPrediccionIcon.setAttribute("class", "eliminar-prediccion-component-i fa-solid fa-trash");

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
		resetearModalBody(showNoResultComponent) {

			const THIZ = this;

			THIZ.prediccionesCoincidentes = [];

			THIZ.idEliminarPrediccion = '';
			
			THIZ.prediccionEliminadaErrorMessage = '',
			
			THIZ.prediccionEliminadaCorrectamenteMessage = '';

			let modalBodyRow = document.getElementById("modalBodyRow");

			while (modalBodyRow.firstChild) {
				modalBodyRow.removeChild(modalBodyRow.firstChild);
			}

			if (showNoResultComponent) {
				
				let modal = new bootstrap.Modal(document.getElementById('eliminarPrediccionModal'));
				
				THIZ.eliminarPrediccionModal = modal;
				
				THIZ.eliminarPrediccionModal.show();
				
				THIZ.errorSearchDescripcion = '';
				THIZ.searchedDescripcion = '';
				this.createNoResultComponent(modalBodyRow);
			}

		},
		eliminarPrediccion() {
			
			const THIZ = this;

			fetch(window.location.origin + "/admin/borrarPrediccion?idPrediccion=" + encodeURIComponent(this.idEliminarPrediccion), {
				method: "POST"
			})
				.then(async res => {
					if (!res.ok) {
						const errorMessage = await res.text();
						THIZ.prediccionEliminadaErrorMessage = "Error: " + errorMessage;
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