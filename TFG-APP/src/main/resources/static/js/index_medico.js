new Vue({
	el: "#index_medico",
	data: function() {
		return {
			gender: '',
			education: '',
			ethcat: '',
			work_income_tcr: '',
			pri_payment_tcr_ki: '',
			age_range: '',
			inputs: [{nombre: 'Gender', variables: ['M', 'F'], seleccion:''}, 
				{nombre: 'Education', variables: ['ML', 'ME', 'MH', 'LO', 'UNK', 'HI'], seleccion:''},
				{nombre: 'Ethcat', variables: ['WHI', 'BLA', 'HIS', 'OTH'], seleccion:''},
				{nombre: 'Work Income Tcr', variables: ['N', 'Y', 'U'], seleccion:''},
				{nombre: 'Pri Paymetn Tcr Ki', variables: ['MC', 'PI', 'MA', 'OT'], seleccion:''},
				{nombre: 'Age Range', variables: ['-40', '-60', '+=60'], seleccion:''},
			],
			cluster: '',
			datosCargados: false
		}
	},

	methods: {
		getNewPatientClassification() {
			const THIZ = this;
			THIZ.datosCargados=false;
			$('#cargando').show();

			const jsonData = {
				"GENDER": this.inputs[0].seleccion,
				"EDUCATION": this.inputs[1].seleccion,
				"ETHCAT": this.inputs[2].seleccion,
				"WORK_INCOME_TCR": this.inputs[3].seleccion,
				"PRI_PAYMENT_TCR_KI": this.inputs[4].seleccion,
				"AGE_RANGE": this.inputs[5].seleccion
			}

			console.log(jsonData);


			fetch(window.location.origin + "/medico/getNewPatientClassification", {
				method: "POST",
				headers: {
					'Content-Type': 'application/json' // Tipo de contenido del cuerpo de la solicitud
				},
				body: JSON.stringify(jsonData)
			})
				.then(res => res.json())
				.then(json => {
					THIZ.cluster= json.Cluster;
					console.log(json);
					THIZ.datosCargados=true;
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
				<div class="card rounded-4 p-0 shadow">
					<div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
						<h2 class="text-center text-white">Herramienta predictiva</h2>
					</div>
					<div class="card-body">
						<form @submit.prevent="getNewPatientClassification">
						
							<div class="form-group mb-3" v-for="i in this.inputs">
								<label>{{i.nombre}}</label>
								<select class="form-select" name="inputs" v-model="i.seleccion">
									<option value="" disabled selected></option>
									<option v-for="variable in i.variables" :value="variable">{{variable}}</option>
								</select>
							</div>
							
							<div v-if="datosCargados" class="form-group col-md-2">
								<label>Cluster</label>
								<input type="text" class="form-control border border-success" v-model="cluster" disabled>
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
	</div>
	`
})

