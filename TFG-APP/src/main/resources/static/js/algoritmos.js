new Vue({
	el: "#algoritmos",
	data: function() {
		return {
			modalSelected: {
				idModal: '',
				modal: ''
			},
			nombreAlgoritmo: '',
			searchedAlgoritmo: '',
			idBorrarAlgoritmo: '',
			algoritmosCoincidentes: [],
			errorMessage: '',
			successMessage: ''
		}
	},
	methods: {

		actualizarSelectedModal(idModal) {

			const THIZ = this;

			let modal = new bootstrap.Modal(document.getElementById(idModal));

			THIZ.modalSelected.modal = modal;

			THIZ.modalSelected.idModal = idModal;

		},

		resetearModalInfo(idModal) {

			const THIZ = this;

			let inputs = document.getElementById(idModal).querySelectorAll('input');

			inputs.forEach(function(input) {
				input.value = '';
			});

			this.resetearModalBody();

			this.createNoResultComponent(document.getElementById('modalBodyRow'))

			THIZ.nombreAlgoritmo = '';
			THIZ.searchedAlgoritmo = '';
			THIZ.algoritmosCoincidentes = [];
			THIZ.idBorrarAlgoritmo = '';

			THIZ.errorMessage = '';
			THIZ.successMessage = '';

		},

		showModal(idModal) {

			const THIZ = this;

			this.resetearModalInfo(idModal);

			if (THIZ.modalSelected.idModal.length === 0) {

				this.actualizarSelectedModal(idModal);

			}
			else {

				if (THIZ.modalSelected.idModal !== idModal) {

					this.actualizarSelectedModal(idModal);
				}

			}

			THIZ.modalSelected.modal.show();

		},

		hideModal() {

			this.modalSelected.modal.hide();
		},

		crearAlgoritmo() {

			const THIZ = this;

			fetch(window.location.origin + "/admin/crearAlgoritmo?nombreAlgoritmo=" + this.nombreAlgoritmo, {
				method: "POST",
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.errorMessage = errorMessage;
						this.modalSelected.modal.hide();
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.text();
				})
				.then(successMessage => {
					THIZ.successMessage = successMessage;
					this.modalSelected.modal.hide();
				})
				.catch(error => console.error(error));

		},
		buscarAlgoritmosCoincidentes() {

			fetch(window.location.origin + "/admin/buscarAlgoritmosCoincidentes?nombreAlgoritmo=" + this.searchedAlgoritmo, {
				method: "POST",
			})
				.then(res => res.json())
				.then(res => {

					const THIZ = this;

					let modalBodyRow = document.getElementById("modalBodyRow");

					THIZ.algoritmosCoincidentes = [];

					this.resetearModalBody();

					if (res.length > 0) {

						THIZ.algoritmosCoincidentes = res;

						this.crearBorrarAlgoritmoLabel(modalBodyRow);

						this.crearBorrarAlgoritmoComponents(modalBodyRow);

					}
					else {
						this.createNoResultComponent(modalBodyRow);
					}
				})
				.catch(error => console.error(error));
		},
		crearBorrarAlgoritmoLabel(modalBodyRow) {
			let borrarAlgoritmoLabel = document.createElement("div");

			borrarAlgoritmoLabel.setAttribute("class", "results-search-label");

			borrarAlgoritmoLabel.innerHTML = "Coincidencias";

			modalBodyRow.append(borrarAlgoritmoLabel);
		},
		crearBorrarAlgoritmoComponents(modalBodyRow) {

			const THIZ = this;

			for (let i = 0; i < this.algoritmosCoincidentes.length; i++) {

				let borrarAlgoritmoContainer = document.createElement("div");

				let borrarAlgoritmoComponent = document.createElement("div");

				let borrarAlgoritmoIcon = document.createElement("i");

				borrarAlgoritmoContainer.setAttribute("class", "results-search-component-container");

				borrarAlgoritmoComponent.setAttribute("class", "results-search-component");

				borrarAlgoritmoIcon.setAttribute("class", "results-search-component-i fa-solid fa-trash");

				borrarAlgoritmoIcon.addEventListener("click", function(event) {

					let icon = event.target;

					let container = icon.parentNode;

					let modalBodyRow = document.getElementById("modalBodyRow");

					let hijos = modalBodyRow.children;

					let indice = Array.prototype.indexOf.call(hijos, container);

					THIZ.idBorrarAlgoritmo = THIZ.algoritmosCoincidentes[indice - 1].id;

					let toast = new bootstrap.Toast(document.getElementById('borrarAlgoritmoToast'));

					toast.show();
				});

				borrarAlgoritmoComponent.innerHTML = this.algoritmosCoincidentes[i].nombreAlgoritmo;

				borrarAlgoritmoContainer.append(borrarAlgoritmoComponent);

				borrarAlgoritmoContainer.append(borrarAlgoritmoIcon);

				modalBodyRow.append(borrarAlgoritmoContainer);

			}

		},
		createNoResultComponent(modalBodyRow) {
			let noResultsComponent = document.createElement("div");

			noResultsComponent.setAttribute("class", "noResults-component");

			noResultsComponent.innerHTML = "¡No hay ninguna coincidencia!";

			modalBodyRow.append(noResultsComponent);
		},
		resetearModalBody() {
			let modalBodyRow = document.getElementById("modalBodyRow");

			while (modalBodyRow.firstChild) {
				modalBodyRow.removeChild(modalBodyRow.firstChild);
			}
		},
		borrarAlgoritmo() {
			
			const THIZ = this;

			fetch(window.location.origin + "/admin/borrarAlgoritmo?idAlgoritmo=" + encodeURIComponent(this.idBorrarAlgoritmo), {
				method: "POST"
			})
				.then(async res => {
					if (!res.ok) {
						const errorMessage = await res.text();

						THIZ.errorMessage = errorMessage;

						let toast = new bootstrap.Toast(document.getElementById('borrarAlgoritmoToast'));

						toast.hide();

						this.modalSelected.modal.hide();

						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.text();
				})
				.then(successMessage => {

					THIZ.successMessage = successMessage;

					let toast = new bootstrap.Toast(document.getElementById('borrarAlgoritmoToast'));

					toast.hide();

					this.modalSelected.modal.hide();
				})
				.catch(error => console.log(error))

		}
	}
})