new Vue({
	el: "#index_medico",
	data: function() {
		return {
			inputs: [{nombre: 'Gender', variables: [], seleccion:''}, 
				{nombre: 'Education', variables: [], seleccion:''},
				{nombre: 'Ethcat', variables: [], seleccion:''},
				{nombre: 'Work Income Tcr', variables: [], seleccion:''},
				{nombre: 'Pri Payment Tcr Ki', variables: [], seleccion:''},
				{nombre: 'Age Range', variables: [], seleccion:''},
			],
			nCluster: '',
			imagenUrl: '',
			imagenCreada: false,
			error: ''
		}
	},
	
	created(){
			fetch(window.location.origin + "/medico/getFeatures", {
				method: "GET"
			})
				.then(res => res.json())
				.then(json => {
					const THIZ = this;
					let features = json.features;
					for(let i=1; i< features.length;i++){
						let feature = features[i];
						
						let arrayFeature = Object.values(feature)[1];
						
						for(let j=0; j<arrayFeature.length;j++){
							THIZ.inputs[i-1].variables.push(String(Object.keys(arrayFeature[j])));
						}
						
					}
				})
				.catch(error => console.error(error));
	},

	methods: {
		getNewPatientClassification() {
			const THIZ = this;
			$('#cargando').show();

			const jsonData = {
				"GENDER": this.inputs[0].seleccion,
				"EDUCATION": this.inputs[1].seleccion,
				"ETHCAT": this.inputs[2].seleccion,
				"WORK_INCOME_TCR": this.inputs[3].seleccion,
				"PRI_PAYMENT_TCR_KI":this.inputs[4].seleccion,
				"AGE_RANGE": this.inputs[5].seleccion
			}

			fetch(window.location.origin + "/medico/getNewPatientClassification", {
				method: "POST",
				headers: {
					'Content-Type': 'application/json' // Tipo de contenido del cuerpo de la solicitud
				},
				body: JSON.stringify(jsonData)
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error = errorMessage;
						$('#cargando').hide();
						throw new Error("Error en la respuesta del servidor: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					
					return res.json();
				})
				.then(data => {
					console.log(data);
					THIZ.imagenCreada = true;
					THIZ.imagenUrl= data.ruta;
					THIZ.nCluster = data.ncluster;
					$('#cargando').hide();
				})
				.catch(error => console.error(error));
		}
	},


	template: `
	<div class="container col-md-12">
		<span>
			<div id="cargando" style="position:fixed; display:none; width: 100%; height: 100%; margin:0; padding:0; top:0; left:0; background:rgba(255,255,255,0.75);">
        		<img id="cargando" src="/images/cargando.gif" style="top:50%; left:50%; position: fixed; transform: translate(-50%, -50%);"/>
   			 </div>
		</span>

		<div class="container mb-5 mt-5">
			<div class="row col-md-6 offset-md-3">
				<div v-if="error != ''" class="alert alert-danger">
					{{this.error}}
				</div>
				<div class="card rounded-4 p-0 shadow">
					<div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
						<h2 class="text-center text-white">Herramienta predictiva</h2>
					</div>
					<div class="card-body">
						<form @submit.prevent="getNewPatientClassification">
						
							<div class="form-group mb-3" v-for="i in this.inputs">
								<label>{{i.nombre}}</label>
								<select class="form-select" name="inputs" v-model="i.seleccion" required>
									<option value="" disabled selected></option>
									<option v-for="variable in i.variables" :value="variable">{{variable}}</option>
								</select>
							</div>
							
							
							<div class="form-group mb-2">
								<div class="row justify-content-center">
									<div class="col text-center">
										<button class="btn btn-outline-custom-color fs-5 fw-semibold"
											type="submit">Calcular</button>
									</div>
								</div>
							</div>
							
						</form>
					</div>
				</div>
			</div>
		</div>
		
		
		<div class="row justify-content-around">
			<div v-if="imagenCreada" class="card col-5 rounded-4 p-0 mb-2 shadow">
				<div class="card-body">
					<p><em>¡Imagen creada correctamente! Haz clic sobre ella para descargarla</em></p>
					<p class="mb-0"><strong>Cluster nº {{this.nCluster}}</strong></p>
					<a v-bind:href="imagenUrl" download="graficaPaciente.png">
						<img id="imagenCluster" v-bind:src="imagenUrl" style="max-width:100%"/>
					</a>
				</div>
			</div>
		</div>	
	</div>
	`
})

