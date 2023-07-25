new Vue({
	el: "#exportarBBDD",
	data: function() {
		return {
			tablas: [],
			tablasSeleccionadas: [],
			iconosTablas: ['fa-solid fa-square-root-variable', 'fa-solid fa-file-invoice',
							'fa-solid fa-chart-line', 'fa-solid fa-bed-pulse',
							'fa-solid fa-rectangle-list', 'fa-solid fa-people-group']
			
		}
	},

	created() {
		const THIZ = this;
		fetch(window.location.origin + "/exportarBBDD/getTablas", {
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

		exportarTablasSeleccionadas() {
			
			const THIZ = this;
			
			for (let i = 0; i < this.tablasSeleccionadas.length; i++) {
				this.exportarTabla(this.tablasSeleccionadas[i]);
			}
			
			THIZ.mostrarTablas = false;
		},

		exportarTabla(tabla) {
			// Realizar una solicitud al backend para exportar la tabla seleccionada
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "/exportarBBDD/exportarTabla?tabla=" + tabla);
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
		
		exportarEstructuraBBDD(){
			fetch(window.location.origin + "/exportarBBDD/exportarEstructuraBBDD", {
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
			
			let tableCard = event.target.closest('.table-card');
			
			let checkboxCard = tableCard.querySelectorAll('input[type=checkbox]')[0];
			
			let tabla = this.tablas[index];
			
			let indiceTablaSeleccionada = this.tablasSeleccionadas.indexOf(tabla);
			
			if(indiceTablaSeleccionada !== -1){
				
				this.cambiarEstilosTableCard(tableCard,checkboxCard,true);
				
				THIZ.tablasSeleccionadas.splice(indiceTablaSeleccionada, 1);
			}
			else{
				
				this.cambiarEstilosTableCard(tableCard,checkboxCard,false);
				
				THIZ.tablasSeleccionadas.push(tabla);
			}
			
		},
		cambiarEstilosTableCard(tableCard,checkboxCard, isSelected){
			
			if(isSelected){
				tableCard.setAttribute("style", "");
			
				checkboxCard.checked = false;
			}
			else{
				tableCard.setAttribute("style", "border: 5px solid rgb(123, 154, 234);box-shadow: 2px 2px 4px 2px rgb(123, 154, 234)");
			
				checkboxCard.checked = true;
			}
		},
		
		selectAllTables(){
			
			const THIZ = this;
			
			this.tablasSeleccionadas = [];
			
			
			
			let tableCards = document.querySelectorAll('.table-card');
			
			for(let i=0; i < tableCards.length; i++){
				
				let checkboxCard = tableCards[i].querySelectorAll('input[type=checkbox]')[0];
				
				this.cambiarEstilosTableCard(tableCards[i], checkboxCard, false);
			}
			
			
			THIZ.tablasSeleccionadas = this.tablas.map(item => item);
		}
	},

	template: `
	<div class="container">
				
		<div v-if="tablas.length > 0" class="row justify-content-around mt-4">
			
			
			<div class="col-12 mb-3">
				<h2 class="text-center fw-bold fst-italic text-custom-color fs-1"><span
						class="text-custom-light-color">Ta</span>blas de <span
						class="text-custom-light-color">la</span> BB<span
						class="text-custom-light-color">DD</span>
				</h2>
			</div>
			
			<div class="row justify-content-center">
			
				<div class="col-md-3 text-center">
					<button class="btn btn-outline-custom-color text-center w-75 fs-5 fw-bold" @click="selectAllTables()">
						Seleccionar todas
					</button>
				</div>
			</div>
			
			
			<div class="table-cards-container">
				
				<div v-for="(tabla, index) in tablas" class="table-card" @click="seleccionarTabla(index, $event)">
					<input type="checkbox" :name="'tabla' + tabla" :id="'tabla' + tabla">
					<div class="table-card-icon">
						<i :class="iconosTablas[index]"></i>
					</div>
					<label class="table-card-label" >{{tabla}}</label>
				</div>
				
			</div>
				
		</div>
		
		<div v-if="tablas.length > 0" class="row justify-content-around mt-5">
				
			<div v-if="tablasSeleccionadas.length > 0" class="col-md-3 text-center mb-3">
				<button @click="exportarTablasSeleccionadas" class="btn btn-outline-custom-color w-75 fs-5 fw-bold">Exportar tablas <i class="fa-solid fa-download"></i></button>
			</div>
			
			<div class="col-md-3 text-center mb-3">
				<button class="btn btn-outline-custom-color w-75 fs-5 fw-bold" @click="exportarEstructuraBBDD()">
					Exportar estructura <i class="fa-solid fa-database fs-5"></i>
				</button>
			</div>
					
		</div>
		
		

		<div v-if="tablas.length===0" class="row">
			<p class="mt-3 text-center  text-custom-color fs-3 fw-bold">No hay tablas a exportar en la base de datos</p>
		</div>
			
	</div>

	
	`


})