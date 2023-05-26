new Vue({
	el: "#predicciones",
	data: function() {
		return {
			errorSearchDescripcion: '',
			searchedDescripcion: '',
			modalBodyComponents: {
				label: null,
				predicciones: [],
				noResults: null
			},
			prediccionesCoincidentes: []
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

					this.resetearModalBody();

					let modalBodyRow = document.getElementById("modalBodyRow");

					if (res.length > 0) {

						THIZ.prediccionesCoincidentes = res;

						let eliminarPrediccionLabel = document.createElement("div");

						eliminarPrediccionLabel.setAttribute("class", "eliminar-prediccion-label");

						eliminarPrediccionLabel.innerHTML = "Coincidencias";

						modalBodyRow.append(eliminarPrediccionLabel);

						for (let i = 0; i < this.prediccionesCoincidentes.length; i++) {

							let eliminarPrediccionComponent = document.createElement("div");

							eliminarPrediccionComponent.setAttribute("class", "eliminar-prediccion-component");

							eliminarPrediccionComponent.innerHTML = this.prediccionesCoincidentes[i].descripcion;

							modalBodyRow.append(eliminarPrediccionComponent);

						}
					}
					else {
						let noResultsComponent = document.createElement("div");

						noResultsComponent.setAttribute("class", "noResults-component");

						noResultsComponent.innerHTML = "¡No hay ninguna coincidencia!";

						modalBodyRow.append(noResultsComponent);
					}


				})
				.catch(error => console.log(error))


		},
		resetearModalBody() {

			const THIZ = this;

			THIZ.prediccionesCoincidentes = [];

			THIZ.modalBodyComponents.label = null;

			THIZ.modalBodyComponents.predicciones = null;

			THIZ.modalBodyComponents.noResults = null;

			let modalBodyRow = document.getElementById("modalBodyRow");

			while (modalBodyRow.firstChild) {
				modalBodyRow.removeChild(modalBodyRow.firstChild);
			}

		}
	},


})