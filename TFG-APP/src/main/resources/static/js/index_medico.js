new Vue({
	el: "#index_medico",
	data: function() {
		return {
			gender: '',
			education: '',
			ethcat: '',
			work_income_tcr: '',
			pri_payment_tcr_ki: '',
			age_range: ''
		}
	},

	methods: {
		getNewPatientClassification() {
			const THIZ = this;

			$('#cargando').show();

			const jsonData = {
				"GENDER": this.gender,
				"EDUCATION": this.education,
				"ETHCAT": this.ethcat,
				"WORK_INCOME_TCR": this.work_income_tcr,
				"PRI_PAYMENT_TCR_KI": this.pri_payment_tcr_ki,
				"AGE_RANGE": this.age_range
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

					console.log(json);

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
									<div class="form-group mb-3">
										<label class="form-label" for="gender">Género</label>
										<input type="text" class="form-control" v-model="gender" id="gender">
									</div>
	
									<div class="form-group mb-3">
										<label class="form-label" for="education">Education</label>
										<input type="text" class="form-control" v-model="education" id="education">
									</div>
	
									<div class="form-group mb-3">
										<label class="form-label" for="ethcat">Ethcat</label>
										<input type="text" class="form-control" v-model="ethcat" id="ethcat">
									</div>
	
									<div class="form-group mb-3">
										<label class="form-label" for="work_income_tcr">Work Income Tcr</label>
										<input type="text" class="form-control" v-model="work_income_tcr"
											id="work_income_tcr">
									</div>
	
									<div class="form-group mb-3">
										<label class="form-label" for="pri_payment_tcr_ki">Pri Payment Tcr Ki</label>
										<input type="text" class="form-control" v-model="pri_payment_tcr_ki"
											id="pri_payment_tcr_ki">
									</div>
	
									<div class="form-group mb-3">
										<label class="form-label" for="age_range">Edad</label>
										<input type="text" class="form-control" v-model="age_range"
											id="age_range">
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

