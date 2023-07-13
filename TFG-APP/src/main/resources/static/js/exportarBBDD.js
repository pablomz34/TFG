new Vue({
	el: "#exportarBBDD",
	data: function() {
		return {
			tablas: [],
			tablasSeleccionadas: [],
			selectAll: false,
			mostrarTablas: false
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
		
		showTables(){
			const THIZ = this;
			
			THIZ.mostrarTablas = true;
		},
		
		selectAllChanged() {
			const THIZ = this;
			if (this.selectAll) {
				THIZ.tablasSeleccionadas = this.tablas.map(item => item);
			}
			else {
				THIZ.tablasSeleccionadas = [];
			}
		},

		exportar() {
			
			const THIZ = this;
			
			for (let i = 0; i < this.tablasSeleccionadas.length; i++) {
				this.exportarTabla(this.tablasSeleccionadas[i]);
			}
			
			THIZ.mostrarTablas = false;
		},

		exportarTabla(tabla) {
			// Realizar una solicitud al backend para exportar la tabla seleccionada
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "/tablas/exportarTabla?tabla=" + tabla);
			xhr.responseType = "blob";
			xhr.onload = function() {
				if (xhr.status === 200) {
					var blob = new Blob([xhr.response], { type: "text/csv" });
					var url = URL.createObjectURL(blob);
					var a = document.createElement("a");
					a.href = url;
					a.download = tabla + ".csv";
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					URL.revokeObjectURL(url);
				}
			};
			xhr.send();


		},
		
		exportarTodo(){
			fetch(window.location.origin + "/tablas/exportarTodo", {
				method: "GET",
			})
		        .then((response) => {
		          if (response.ok) {
		            return response.blob();
		          } else {
		            throw new Error('Error exporting database dump');
		          }
		        })
		        .then((blob) => {
		          const url = window.URL.createObjectURL(blob);
		          const link = document.createElement('a');
		          link.href = url;
		          link.download = 'database_structure.sql';
		          link.click();
		          window.URL.revokeObjectURL(url);
		        })
		        .catch((error) => {
		          console.error(error);
		        });
		},
		
		seleccionarTabla(index, event){
			
			const THIZ = this;
			
			THIZ.tablasSeleccionadas.push(this.tablas[index]);
			
			let tableCard = event.target.closest('.tabla-card');
			
			tableCard.setAttribute("style", "border: 5px solid rgb(67, 111, 224); box-shadow: 6px 6px 12px 6px rgb(92, 130, 228)")
		
			let tableCardIcon = document.createElement("i");
		
			tableCardIcon.setAttribute("class", "fa-solid fa-circle-check tabla-card-icon");
		
			tableCard.append(tableCardIcon);
		}
	},

	template: `
	<div class="container">
	
		<div class="row justify-content-around mt-4">
		
			<div class="col mx-5">
				<button class="btn btn-outline-custom-color fs-5 fw-semibold mt-2 w-100" @click="showTables()">
					Exportar datos de la BBDD <i class="fa-solid fa-table fs-5"></i>
				</button>
				
			</div>
			<div class="col mx-5">
				<button class="btn btn-outline-custom-color fs-5 fw-semibold mt-2 w-100" @click="exportarTodo()">
					Exportar estructura de la BBDD <i class="fa-solid fa-database fs-5"></i>
				</button>
			</div>
		</div>
		
		
		<div v-if="mostrarTablas" class="row justify-content-around mt-4">
			
			
			<div class="col-12 mb-5">
				<h2 class="text-center fw-bold fst-italic text-custom-color fs-1"><span
						class="text-custom-light-color">Ta</span>blas
				</h2>
			</div>
			
			
			<div v-for="(tabla, index) in tablas" class="col-md-5">
				<div class="row justify-content-center">
					<div class="tabla-card">
						<div class="tabla-card-rectangle"></div>
						
						<div class="d-flex justify-content-center flex-column mb-3" style="height: 325px; padding-top: 160px;">
							
							 <div class="p-2">
							 	<label class="tabla-card-table-name">{{tabla}}</label>
							 </div>
							 <div class="mb-auto p-2">
							 	<p class="text-center"><a class="fs-5 fw-bold link-custom-color link-offset-2 link-underline link-underline-opacity-100" href="#">+ Información</a></p>
							 </div>
							
							<div class="p-2 d-flex justify-content-center">
								<button @click="seleccionarTabla(index, $event)" class="btn btn-outline-custom-color fs-5 fw-semibold rounded-5">Seleccionar</button>
							</div>
							
						</div>
						
						
					</div>
				</div>
				
			</div>
			
			<div v-if="tablasSeleccionadas.length > 0" class="row justify-content-center">
				
				<div class="col-3">
					<button @click="exportar" class="btn btn-outline-custom-color w-100 fs-5 fw-bold">Exportar tablas <i class="fa-solid fa-download"></i></button>
				</div>
			</div>
				
		</div>
		
		
		
		<!--
		<button class="btn btn-outline-custom-color fs-5 fw-semibold mt-2 w-100" @click="exportar()">
					Exportar datos de la BBDD <i class="fa-solid fa-table fs-5"></i>
				</button>
		
		-->
		
		<!--<div v-if="tablas.length !== 0" class="row justify-content-center my-3">

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
								<th class="fs-5 text-white text-center">
									Tabla 	
								</th>
								<th class="fs-5 text-white text-left">
									<label>Marcar todos </label>
	                    			<input class="form-check-input" type="checkbox" v-model="selectAll" @change="selectAllChanged()">
								</th>
							</tr> 
						</thead>
						<tbody>
							<tr v-for="tabla in tablas">
								<td class="fw-bold text-light" id=tabla>{{tabla}}</td>
								<td><input class="form-check-input" type="checkbox" :value="tabla" v-model="tablasSeleccionadas"></td>
							</tr>
						</tbody>
					</table>
				</div>
				
			</div>

		</div>-->

		<div v-if="tablas.length===0" class="row">
			<p class="mt-3 text-center  text-custom-color fs-3 fw-bold">No hay tablas a exportar en la base de datos</p>
		</div>
		
		
		
	</div>

	
	`


})