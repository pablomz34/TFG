new Vue({
	el: "#utils",
	data: function() {
		return {
			predicciones: [],
			prediccionErrorMessage: '',
			prediccionSuccessMessage: '',
			columnaNombreOrdenada: false,
			columnaApellidosOrdenada: false,
			columnaCorreoOrdenada: false,
			columnaDniOrdenada: false,
			columnaPrediccionesOrdenada: false
		}
	},

	mounted() {

		const THIZ = this;
		
		let isPrediccionesTemplate = this.$el.getAttribute("data-isPrediccionesTemplte");

		if (isPrediccionesTemplate) {
			for (let i = 0; i < predicciones.length; i++) {
				let dict = {};

				dict["descripcion"] = predicciones[i].descripcion;
				dict["id"] = predicciones[i].id;
				THIZ.predicciones.push(dict);
			}
		}

	},

	methods: {

		howToOrderColumn(columnName) {
			const THIZ = this;
			switch (columnName) {

				case "nombre":

					if (this.columnaNombreOrdenada) {
						THIZ.columnaNombreOrdenada = false;
					}
					else {
						THIZ.columnaNombreOrdenada = true;
					}

					this.changeIcon(columnName, this.columnaNombreOrdenada);

					this.sortColumn(columnName, this.columnaNombreOrdenada, "medicosRegistradosTable");
					break;
				case "apellidos":

					if (this.columnaApellidosOrdenada) {
						THIZ.columnaApellidosOrdenada = false;
					}
					else {
						THIZ.columnaApellidosOrdenada = true;
					}

					this.changeIcon(columnName, this.columnaApellidosOrdenada);

					this.sortColumn(columnName, this.columnaApellidosOrdenada, "medicosRegistradosTable");
					break;
				case "correo":

					if (this.columnaCorreoOrdenada) {
						THIZ.columnaCorreoOrdenada = false;
					}
					else {
						THIZ.columnaCorreoOrdenada = true;
					}

					this.changeIcon(columnName, this.columnaCorreoOrdenada);

					this.sortColumn(columnName, this.columnaCorreoOrdenada, "medicosRegistradosTable");
					break;
				case "dni":

					if (this.columnaDniOrdenada) {
						THIZ.columnaDniOrdenada = false;
					}
					else {
						THIZ.columnaDniOrdenada = true;
					}

					this.changeIcon(columnName, this.columnaDniOrdenada);

					this.sortColumn(columnName, this.columnaDniOrdenada, "medicosRegistradosTable");
					break;
				case "prediccion":

					if (this.columnaPrediccionesOrdenada) {
						THIZ.columnaPrediccionesOrdenada = false;
					}
					else {
						THIZ.columnaPrediccionesOrdenada = true;
					}

					this.changeIcon(columnName, this.columnaPrediccionesOrdenada);

					this.sortColumn(columnName, this.columnaPrediccionesOrdenada, "prediccionesRegistradasTable");
					break;
				default:
					break;
			}
		},

		sortColumn(columnName, ordenarAZ, tabla) {

			let table = document.getElementById(tabla);

			let rows = table.rows;

			let values = [];

			switch (tabla) {
				case "medicosRegistradosTable":
					for (let i = 1; i < rows.length; i++) {
						let dict = {};
						dict["nombre"] = rows[i].getElementsByTagName("TD")[0].innerHTML;
						dict["apellidos"] = rows[i].getElementsByTagName("TD")[1].innerHTML;
						dict["correo"] = rows[i].getElementsByTagName("TD")[2].innerHTML;
						dict["dni"] = rows[i].getElementsByTagName("TD")[3].innerHTML;

						values.push(dict);
					}

					if (ordenarAZ) {
						values.sort(function(a, b) {
							if (a[columnName].toLowerCase() < b[columnName].toLowerCase()) {
								return -1;
							}
							if (a[columnName].toLowerCase() > b[columnName].toLowerCase()) {
								return 1;
							}
							return 0;
						});
					}
					else {
						values.sort(function(a, b) {
							if (a[columnName].toLowerCase() < b[columnName].toLowerCase()) {
								return 1;
							}
							if (a[columnName].toLowerCase() > b[columnName].toLowerCase()) {
								return -1;
							}
							return 0;
						});
					}


					for (let i = 1; i < rows.length; i++) {
						rows[i].getElementsByTagName("TD")[0].innerHTML = values[i - 1].nombre;
						rows[i].getElementsByTagName("TD")[1].innerHTML = values[i - 1].apellidos;
						rows[i].getElementsByTagName("TD")[2].innerHTML = values[i - 1].correo;
						rows[i].getElementsByTagName("TD")[3].innerHTML = values[i - 1].dni;
					}
					break;
				case "prediccionesRegistradasTable":

					for (let i = 1; i < rows.length; i++) {
						let dict = {};
						dict["prediccion"] = rows[i].getElementsByTagName("TD")[0].innerHTML;
						values.push(dict);
					}

					if (ordenarAZ) {
						values.sort(function(a, b) {
							if (a[columnName].toLowerCase() < b[columnName].toLowerCase()) {
								return -1;
							}
							if (a[columnName].toLowerCase() > b[columnName].toLowerCase()) {
								return 1;
							}
							return 0;
						});
					}
					else {
						values.sort(function(a, b) {
							if (a[columnName].toLowerCase() < b[columnName].toLowerCase()) {
								return 1;
							}
							if (a[columnName].toLowerCase() > b[columnName].toLowerCase()) {
								return -1;
							}
							return 0;
						});
					}


					for (let i = 1; i < rows.length; i++) {
						rows[i].getElementsByTagName("TD")[0].innerHTML = values[i - 1].prediccion;
					}
					break;
				default:
					break;
			}



		},
		changeIcon(columnName, ordenarAZ) {

			let icono = document.getElementById("icono" + columnName);

			if (ordenarAZ) {
				icono.setAttribute("class", "fa-solid fa-arrow-down-z-a fs-5");
			}
			else {
				icono.setAttribute("class", "fa-solid fa-arrow-up-z-a fs-5");
			}
		},

		eliminar(id) {

			const THIZ = this;

			THIZ.prediccionErrorMessage = '';
			THIZ.prediccionSuccessMessage = '';

			if (confirm("¿Estás seguro de que quieres borrar este elemento?")) {

				fetch(window.location.origin + "/admin/borrarPrediccion?idPrediccion=" + id, {
					method: "POST"
				}).then(async res => {

					if (!res.ok) {
						const errorMessage = await res.text();
						THIZ.prediccionErrorMessage = errorMessage;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.text();

				})
					.then(successMessage => {
						THIZ.prediccionSuccessMessage = successMessage;
					})
					.catch(err => console.log(err));


			}

		}
	},


})

