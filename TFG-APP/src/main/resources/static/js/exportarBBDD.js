new Vue({
	el: "#exportarBBDD",
	data: function() {
		return {
			tablas: [],
		}
	},

	created() {
		const THIZ = this;
		fetch(window.location.origin + "/tablas/getTablas", {
			method: "GET",
		})
			.then(async res => {
				if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
					const errorMessage = await res.text();
					throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
				}
				return res.json();
			})
			.then(data => {
				THIZ.tablas = data;
			})
			.catch(error => console.error(error));
	},

	methods: {
		exportarTabla() {
			//var tablaSeleccionada = document.getElementById("tabla").value;

			var tabla = document.getElementById("tablasTable");
			var inputsMarcados = tabla.querySelectorAll("input[type='checkbox']:checked");
			inputsMarcados.forEach(function(input) {
				// Realizar alguna acción con el input marcado
				console.log("Input marcado:", input.value);
			});
			// Realizar una solicitud al backend para exportar la tabla seleccionada
			/* var xhr = new XMLHttpRequest();
			xhr.open("GET", "/tablas/exportarTabla?tabla=" + tablaSeleccionada);
			xhr.responseType = "blob";
			xhr.onload = function () {
				if (xhr.status === 200) {
					var blob = new Blob([xhr.response], {type: "text/csv"});
					var url = URL.createObjectURL(blob);
					var a = document.createElement("a");
					a.href = url;
					a.download = tablaSeleccionada + ".csv";
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					URL.revokeObjectURL(url);
				}
			};
			xhr.send(); */
		}
	},

	template: `
	<div class="container">
		<div v-if="tablas.length !== 0" class="row justify-content-center my-3">

			<div class="col-12 mb-3">
				<h2 class="text-center fw-bold fst-italic text-custom-color fs-1">Expo<span
						class="text-custom-light-color">rtar ta</span>blas
				</h2>
			</div>

			<div>
				<div class="table-responsive shadow-lg p-0"
					style="max-height: 500px !important; overflow-y: auto !important;">
					<table id="tablasTable" class="table table-custom-color table-striped-columns table-hover m-0">
						<thead class="table-custom-color-table-head">
							<tr>
								<th class="fs-5 text-white text-center">Tabla 
									<!-- <button @click="howToOrderColumn('tabla')" class="btn btn-unstyled p-0">
										<i id="iconotabla" class="fa-solid fa-arrow-up-z-a fs-5"></i>
									</button> -->
								</th>
								<th class="fs-5 text-white text-center"></th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="tabla in tablas">
								<td class="fw-semibold text-light" id=tabla>{{tabla}}</td>
								<td><input class="form-check-input" type="checkbox" :value="tabla"></td>
							</tr>
						</tbody>
					</table>
				</div>
				<button class="export-button" onclick="exportarTabla()">Exportar</button>
			</div>

		</div>

		<div v-if="tablas.length===0" class="row">
			<p class="mt-3 text-center  text-custom-color fs-3 fw-bold">No hay tablas a exportar en la base de datos</p>
		</div>
	</div>

	
	`


})