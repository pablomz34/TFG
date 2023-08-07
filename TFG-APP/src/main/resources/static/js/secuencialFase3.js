
import { mixinFase3 } from './abstractMixinsFases.js';

new Vue({
	el: "#secuencialFase3",
	mixins: [mixinFase3],
	data: function() {
		return {
			algoritmoOptimo: '',
			continueButton: false
		}
	},

	methods: {
		getVarianceMetrics: function() {
			const THIZ = this;
			THIZ.errorMessage = '';

			fetch(window.location.origin + "/admin/procesamientos/secuencial/getVarianceMetrics", {
				method: "POST"
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.error = errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.json();

				})
				.then(data => {

					for (let i = 0, j = 1; j < data.lista.length; i++, j++) THIZ.lista[i] = data.lista[j]

					THIZ.algoritmoOptimo = data.algoritmoOptimo;
					THIZ.datosCargados = true;
					THIZ.continueButton = true;
					THIZ.mostrarCargando = false;
				})
				.catch(error => console.error(error));

		},
		siguienteFase() {
			const THIZ = this;

			THIZ.errorMessage = '';

			fetch(window.location.origin + "/admin/procesamientos/secuencial/siguienteFase", {
				method: "POST"
			})
				.then(async res => {

					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.errorMessage = errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.text();

				})
				.then(nextUrl => {

					window.location.href = nextUrl;

				})
				.catch(error => console.error(error))
		}
	},
	template: `
		<div class="container mb-5 mt-5">
		    <span>
		        <div id="cargando" v-show="mostrarCargando" style="position: fixed; display: none; width: 100%; height: 100%; margin: 0; padding: 0; top: 0; left: 0; background: rgba(255, 255, 255, 0.75); z-index: 9999;">
		            <img id="cargando" src="/images/cargando.gif" style="top: 50%; left: 50%; position: fixed; transform: translate(-50%, -50%); z-index: 9999;"/>
		        </div>
		    </span>
		    
		    <div class="row justify-content-center mt-3">
				<div v-if="errorMessage != ''" class="col-md-5">
					<div class="alert alert-danger alert-dismissible fade show" role="alert">
						{{errorMessage}}
						<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
					</div>
				</div>
			</div>
		
		    <div class="col-md-6 offset-md-3">
		        <div class="card rounded-4 p-0 shadow">
		            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
		                <h2 class="text-center text-white">Métricas de Varianza</h2>
		            </div>
		            <div class="card-body">
		                <form @submit.prevent="getVarianceMetrics">
		               
		                    <div class="form-group mb-2">
		                        <div class="row justify-content-center">
		                            <div class="col text-center">
		                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Ejecutar</button>
		                            </div>
		                        </div>
		                    </div>
		                </form>
		            </div>
		        </div>
		    </div>
		    
		    
		    <div v-if="continueButton" class="row justify-content-center m-2">	
				<button type="button" @click="siguienteFase" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
			</div>
		
		    <div v-if="datosCargados" class="table-responsive shadow-lg p-0 mt-4">
		        <table class="table table-custom-color table-striped-columns table-hover shadow-lg m-0">
		            <thead class="table-custom-color-table-head">
		                <tr>
		                    <th v-for="head in headers" class="fs-5 text-white">
		                        {{head.header}}
		                    </th>
		                </tr>
		            </thead>
		
		            <tbody>
		                <tr v-for="i in lista">
		                    <td class="fw-semibold text-light">{{i.metric}}</td>
		                    <td class="fw-semibold text-light">{{i.tss_value}}</td>
		                    <td class="fw-semibold text-light">{{i.total_wc}}</td>
		                    <td class="fw-semibold text-light">{{i.total_bc}}</td>
		                </tr>
		            </tbody>
		        </table>
		    </div>
		    
		   	<div v-if="continueButton" class="col-md-4 offset-md-4 text-center mt-2 alert alert-success">
				El algoritmo que se usará en fases siguientes es: {{this.algoritmoOptimo}}
		    </div>
		</div>
	`
})