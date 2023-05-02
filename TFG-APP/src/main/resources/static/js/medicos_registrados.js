new Vue({
	el: "#medicosRegistrados",
	data: function() {
		return {
			columnaNombreOrdenada: false,
			columnaApellidosOrdenada: false,
			columnaCorreoOrdenada: false,
			columnaDniOrdenada: false,
		}
	},

	methods: {

		howToOrderColumn(columnName) {
			const THIZ = this;
			switch(columnName){
				
				case "nombre":
				
				if(this.columnaNombreOrdenada){
					THIZ.columnaNombreOrdenada = false;
				}
				else{
					THIZ.columnaNombreOrdenada = true;
				}
				
				this.changeIcon(columnName, this.columnaNombreOrdenada);
				
				this.sortColumn(columnName, this.columnaNombreOrdenada);
				break;
				case "apellidos":
				
				if(this.columnaApellidosOrdenada){
					THIZ.columnaApellidosOrdenada = false;
				}
				else{
					THIZ.columnaApellidosOrdenada = true;
				}
				
				this.changeIcon(columnName, this.columnaApellidosOrdenada);
				
				this.sortColumn(columnName, this.columnaApellidosOrdenada);
				break;
				case "correo":
				
				if(this.columnaCorreoOrdenada){
					THIZ.columnaCorreoOrdenada = false;
				}
				else{
					THIZ.columnaCorreoOrdenada = true;
				}
				
				this.changeIcon(columnName, this.columnaCorreoOrdenada);
				
				this.sortColumn(columnName, this.columnaCorreoOrdenada);
				break;
				case "dni":
				
				if(this.columnaDniOrdenada){
					THIZ.columnaDniOrdenada = false;
				}
				else{
					THIZ.columnaDniOrdenada = true;
				}
				
				this.changeIcon(columnName, this.columnaDniOrdenada);
				
				this.sortColumn(columnName, this.columnaDniOrdenada);
				break;
				default:
				break;
			}
		},

		sortColumn(columnName, ordenarAZ) {

			let table = document.getElementById("medicosRegistradosTable");

			let rows = table.rows;

			let values = [];

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
		},
		changeIcon(columnName, ordenarAZ){
			
			let icono = document.getElementById("icono" + columnName);
			
			if(ordenarAZ){
				icono.setAttribute("class", "fa-solid fa-arrow-down-z-a fs-5");
			}
			else{
			icono.setAttribute("class", "fa-solid fa-arrow-up-z-a fs-5");
			}
		}
	}
})