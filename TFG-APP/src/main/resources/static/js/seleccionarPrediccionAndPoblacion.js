new Vue({
	el: "#seleccionarPrediccionAndPoblacion",
	data: function() {
		return {
			predicciones: [],
			prediccionSeleccionada: '',
			pacientesPrediccion: '',
			csvUploadPoblacion: '',
			showContinueButton: false,
			uploadPoblacionInfo: false,
			errorMessage: ''
		}
	},

	mounted() {
		fetch(window.location.origin + "/admin/getAllPredicciones", {
			method: "GET"
		})
			.then(res => res.json())
			.then(predicciones => {

				const THIZ = this;

				THIZ.predicciones = predicciones;
			})
			.catch(error => console.error(error));
	},

	methods: {
		seleccionarRadioButton(event) {

			const THIZ = this;

			THIZ.showContinueButton = false;
			THIZ.csvUploadPoblacion = '';
			THIZ.errorMessage = '';

			let radios = document.querySelectorAll('input[type="radio"]');

			for (let i = 0; i < radios.length; i++) {
				let radioButtonContainer = radios[i].closest('.radio-button-container');
				let radioButtonLabel = radios[i].nextElementSibling;
				if (radios[i].id === event.target.id) {
					radioButtonContainer.setAttribute("style", "background-color: rgb(223, 231, 251); border: 3px solid rgb(123, 154, 234);");
					radioButtonLabel.setAttribute("style", "color: rgb(91, 130, 232)");
				}
				else {
					radios[i].checked = false;
					radioButtonContainer.setAttribute("style", "");
					radioButtonLabel.setAttribute("style", "");
				}

			}

			if (event.target.id === 'radioButton1') {
				THIZ.uploadPoblacionInfo = false;
				THIZ.showContinueButton = true;
			}
			else if (event.target.id === 'radioButton2') {
				THIZ.uploadPoblacionInfo = true;
			}

		},
		archivoSeleccionado(){
			
			const THIZ = this;
			
			THIZ.csvUploadPoblacion = this.$refs.csvUploadPoblacion.files[0];
			
			THIZ.showContinueButton = true;
		},
		seleccionarPrediccionAndPoblacion() {

			const THIZ = this;

			const formData = new FormData();

			if (THIZ.csvUploadPoblacion !== '') {
				formData.append("file", THIZ.csvUploadPoblacion);
			}
			
			THIZ.errorMessage = '';

			fetch(window.location.origin + "/admin/procesamientoSecuencial/actualizarInformacionPrediccionAndPacientes?descripcion=" + this.prediccionSeleccionada, {
				method: "POST",
				body: formData
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();

						THIZ.errorMessage = errorMessage;

						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.text();
				})
				.then(nextUrlSecuencial => {

					const THIZ = this;

					window.location.href = nextUrlSecuencial;

				})
				.catch(error => console.error(error));

		}
	},
	watch: {
		'prediccionSeleccionada': function(newValue, oldValue) {

			const THIZ = this;

			THIZ.uploadPoblacionInfo = false;
			THIZ.pacientesPrediccion = '';
			THIZ.showContinueButton = false;
			THIZ.csvUploadPoblacion = '';
			THIZ.errorMessage = '';

			if (newValue.length > 0) {

				fetch(window.location.origin + "/admin/procesamientoSecuencial/getPacientesPrediccion?descripcion=" + newValue, {
					method: "GET"
				})
					.then(async res => {
						if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
							const errorMessage = await res.text();
							THIZ.errorMessage = errorMessage;
							throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
						}
						return res.text();
					})
					.then(pacientes => {

						THIZ.pacientesPrediccion = Number(pacientes);

					})
					.catch(error => console.error(error));
			}
		}
	},
	template: `
		<div class="container-fluid pt-2">
		
			<div class="row justify-content-center mt-3">
				<div v-if="errorMessage != ''" class="col-md-5">
					<div class="alert alert-danger alert-dismissible fade show" role="alert">
						{{errorMessage}}
						<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
					</div>
				</div>
			</div>		
			
			<div class="row justify-content-around" style="margin-top: 50px;">
				<div class="col-md-6">
					<div class="card rounded-4 p-0 shadow">
			            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
			                <h2 class="text-center text-white">Seleccionar predicción</h2>
			            </div>
			            <div class="card-body">
										        
		                	<div v-if="predicciones.length == 0">
		                		<h4 class="text-center">No hay predicciones creadas</h4>
		                		<h4 class="text-center"><a :href="'predicciones'">Crea una aquí</a></h4>
		  
		                	</div>			           
		                	<div v-else class="form-group mb-3">
		                	
		                		<div class="input-container mt-2">
					                <label for="selectDescripcion" class="input-container-label fw-bold">Seleccione una predicción</label>
									
									<select class="input-container-select" id="selectDescripcion" name="selectDescripcion" v-model="prediccionSeleccionada" required>
			                       		<option class="input-container-select-option" v-for="descripcion in predicciones" :value="descripcion">{{descripcion}}</option>
			                    	</select>
		                    	</div>
			                    	
	                    	</div>
	                    	
	                    	<div v-if="pacientesPrediccion > 0" class="radio-button-container">
							  						  
								  <input class="radio-button" type="radio" @change="seleccionarRadioButton" name="radioButton1" id="radioButton1">
								  <label class="radio-button-label" for="radioButton1">
								    Utilizar datos de población de la base de datos
								  </label>
							</div>
									
							<div v-if="pacientesPrediccion > 0" class="radio-button-container">
							 	  <input class="radio-button" type="radio" @change="seleccionarRadioButton" name="radioButton2" id="radioButton2">
								  <label class="radio-button-label" for="radioButton2">
								    Subir nuevos datos de población a la base de datos
								  </label>
							</div>
							
							<div v-if="pacientesPrediccion === 0 || uploadPoblacionInfo" class="form-group mt-4 mb-3">
		                    	<div class="input-container">
			                        <label for="csv" class="input-container-input-file-label fw-bold">Archivo csv</label>
			                        <input class="input-container-input-file" accept=".csv" @change="archivoSeleccionado" type="file" id="csv" ref="csvUploadPoblacion" required />
	                   			</div>
		                    </div>	
			            </div>
		        	</div>
	        	</div>				
			</div>
			
				
			<div v-if="showContinueButton" class="row justify-content-center mt-5">	
					<button type="button" @click="seleccionarPrediccionAndPoblacion" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
			</div>
			
		</div>
	`
})