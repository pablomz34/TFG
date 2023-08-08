
import { mixinFase5 } from './abstractMixinsFases.js';

new Vue({
	el: "#secuencialFase5",
	mixins: [mixinFase5],
	data: function() {
		return {
			terminarProcesoButton: false,
			algoritmoOptimo: ''
		}
	},

	created() {

		const THIZ = this;

		fetch(window.location.origin + "/admin/procesamientos/secuencial/getAlgoritmoOptimo", {
			method: "GET"
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
			.then(algoritmoOptimo => {

				THIZ.algoritmoOptimo = algoritmoOptimo;

			})
			.catch(error => console.error(error))
	},


	methods: {

		getModelPerformance() {

			const THIZ = this;

			THIZ.datosCargados = false;

			THIZ.errorMessage = '';

			THIZ.mostrarCargando = true;

			fetch(window.location.origin + "/admin/procesamientos/secuencial/getModelPerformance", {
				method: "POST"
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.errorMessage = errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.json();
				})
				.then(data => {
					THIZ.auc = data.auc + '%';
					THIZ.datosCargados = true;
					THIZ.mostrarCargando = false;
					THIZ.terminarProcesoButton = true;
				})
				.catch(error => console.error(error));
		},

		terminarProceso() {
			const THIZ = this;

			THIZ.errorMessage = '';


			fetch(window.location.origin + "/admin/procesamientos/secuencial/terminarProceso", {
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
		
		<div class="row justify-content-center mb-4">
		   	<div class="algoritmo-optimo-component text-center">
						
				<span class="text-center mb-1">Algoritmo Óptimo</span>
				
				<i class="fa-solid fa-arrow-down fs-4 text-center" style="color: rgb(220, 227, 250)"></i>
							
				<span class="text-center" style="color: rgb(63, 103, 224);">{{this.algoritmoOptimo}}</span>			
				
		    </div>
	    </div>
	
	    <div class="row col-md-6 offset-md-3 text-center">
	       
	        <div class="card rounded-4 p-0 mb-2 shadow">
	           
	            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
	                <h2 class="text-center text-white">Rendimiento del modelo</h2>
	            </div>
	            <div class="card-body">
	                <form @submit.prevent="getModelPerformance">
	              
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
	
	    <div class="row col-md-4 offset-md-4 mt-1 justify-center text-center">
	        <div v-if="datosCargados" class="card rounded-4 p-0 mb-2 shadow">
	            <div class="card-body">	            
	                <div class="form-group mb-3">
	                	<div class="input-container">
	                        <label class="input-container-label fw-bold">AUC</label>
	                        <input type="text" class="input-container-input pe-1 fw-bold" v-model="auc" disabled/>
	                	</div>
	                </div>
	            </div>        
	        </div>
	    </div>
	    
	    <div v-if="terminarProcesoButton" class="row justify-content-center my-4">	
			<button type="button" @click="terminarProceso" class="next-button" style="justify-content: center;">Terminar</button>	
		</div>
	</div>

	`
})