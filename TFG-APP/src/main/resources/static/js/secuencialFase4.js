
import { mixinFase4 } from './abstractMixinsFases.js';

new Vue({
	el: "#secuencialFase4",
	mixins: [mixinFase4],
	data: function() {
		return {
			algoritmoOptimo: '',
			continueButton: false,
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
					THIZ.errorMessage1 = errorMessage;
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

	computed: {
		nClustersRange() {
			return Array.from({ length: this.nClusters }, (_, index) => index);
		}
	},

	methods: {
		createPopulationAndCurves: function() {
			const THIZ = this;
			THIZ.curvasCargadas = false;
			THIZ.perfilCargado = false;
			THIZ.errorMessage1 = '';
			THIZ.errorMessage2 = '';
			THIZ.curvasAndPerfilesCreados = false;
			THIZ.mostrarCargando = true;

			fetch(window.location.origin + "/admin/procesamientos/secuencial/createPopulationAndCurves", {
				method: "POST"
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.errorMessage1 = errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.text();
				})
				.then(data => {
					THIZ.nClusters = data;
					THIZ.curvasAndPerfilesCreados = true;
					THIZ.continueButton = true;
					THIZ.mostrarCargando = false;
				})
				.catch(error => console.error(error));
		},

		siguienteFase() {
			const THIZ = this;
			THIZ.errorMessage1 = '';
			THIZ.errorMessage2 = '';
			THIZ.errorMessage3 = '';

			fetch(window.location.origin + "/admin/procesamientos/secuencial/siguienteFase", {
				method: "POST"
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.errorMessage1 = errorMessage;
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
				<div v-if="errorMessage1 != ''" class="col-md-5">
					<div class="alert alert-danger alert-dismissible fade show" role="alert">
						{{errorMessage1}}
						<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
					</div>
				</div>
			</div>
		
		    <div class="row justify-content-around">
		        <div class="card col-7 rounded-4 p-0 mb-3 shadow">
		            
		            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
		                <h2 class="text-center text-white">Crear curvas de supervivencia y perfil de población. Algoritmo óptimo: {{this.algoritmoOptimo}}</h2>
		            </div>
		            <div class="card-body">
		                <form @submit.prevent="createPopulationAndCurves">       
		
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
		    
		    <div class="row justify-content-around">
		    
				<div v-if="errorMessage2 != ''" class="col-5 alert alert-danger alert-dismissible fade show" role="alert">
					{{errorMessage2}}
					<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
				</div>
				
		        <div v-if="errorMessage2 == ''" class="col-5"></div>
		        
		        <div v-if="errorMessage3 == ''" class="col-5"></div>
		        
				<div v-if="errorMessage3 != ''" class="col-5 alert alert-danger alert-dismissible fade show" role="alert">
					{{errorMessage3}}
					<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
				</div>
			
		    </div>
		    
		    <div class="row justify-content-around">
		        <div v-if="curvasAndPerfilesCreados" class="card col-5 rounded-4 p-0 mb-2 shadow">
		            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
		                <h2 class="text-center text-white">Curva de cluster</h2>
		            </div>
		            <div class="card-body">
		                <form @submit.prevent="mostrarClusterSurvivalCurve(true)">
		                    <div class="form-group mb-3">
		                    	<div class="input-container">	                 
		                    		<label for="clusterSeleccionadoCurves" class="input-container-label fw-bold">Número de cluster</label>
									<select class="input-container-select" name="nCluster" v-model="clusterSeleccionadoCurves" id="clusterSeleccionadoCurves" required>
			                       		<option class="input-container-select-option" value="-1">Todas las curvas</option>
			                       		<option class="input-container-select-option" v-for="i in nClustersRange" :value="i">{{i}}</option>
			                    	</select>
		                    	</div>
		                    </div>	                    
		                    	                                   	           	
		                    <div class="form-group mb-2">
		                        <div class="row justify-content-center">
		                            <div class="col text-center">
		                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Mostrar</button>
		                            </div>
		                        </div>
		                    </div>
		                </form>
		            </div>
		        </div>
		        
		        
		        <div v-if="curvasAndPerfilesCreados" class="card col-5 rounded-4 p-0 mb-2 shadow">
		            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
		                <h2 class="text-center text-white">Perfil de cluster</h2>
		            </div>
		            <div class="card-body">
		                <form @submit.prevent="mostrarClusterProfile(true)">
		                    <div class="form-group mb-3">
		                    	<div class="input-container">
			                        <label for="clusterSeleccionadoProfile" class="input-container-label fw-bold">Número de cluster</label>
									<select class="input-container-select" name="nCluster" v-model="clusterSeleccionadoProfile" id="clusterSeleccionadoProfile" required>
			                       		<option class="input-container-select-option" value="-1">Todas las curvas</option>
			                       		<option class="input-container-select-option" v-for="i in nClustersRange" :value="i">{{i}}</option>
			                    	</select>
		                    	</div>
		                    </div>
			             	
		                    <div class="form-group mb-2">
		                        <div class="row justify-content-center">
		                            <div class="col text-center">
		                                <button class="btn btn-outline-custom-color fs-5 fw-semibold" type="submit">Mostrar</button>
		                            </div>
		                        </div>
		                    </div>
		                </form>
		            </div>
		        </div> 
		    </div>
		    
		    <div class="row justify-content-around">
		        <div v-if="curvasCargadas" class="card col-5 rounded-4 p-0 mb-2 shadow">
		        	<h4 v-if="clusterSeleccionadoCurves == -1" class="text-center text-white">Todas las curvas</h4>
		        	<h4 v-else class="text-center text-white">Cluster {{clusterSeleccionadoCurves}}</h4>
		            <div class="card-body">
		                <p><em>¡Imagen creada correctamente! Haz clic sobre ella para descargarla</em></p>
		                <a v-bind:href="curvasUrl" :download="nombreDescargaCurvas">
		                    <img id="curvasUrl" v-bind:src="curvasUrl" style="max-width: 100%;"/>    
		                </a>
		            </div>
		        </div>
		        <div v-else class="col-5 mb-2"/>
		        <div v-if="perfilCargado" class="card col-5 rounded-4 p-0 mb-2 shadow">
		       		<h4 v-if="clusterSeleccionadoProfile == -1" class="text-center text-white">Todas las curvas</h4>
		        	<h4 v-else class="text-center text-white">Cluster {{clusterSeleccionadoProfile}}</h4>
		            <div class="card-body">
		                <h2>Overview</h2>
		                <overview :statistics="this.datasetStatistics"/>
		            </div>
		        </div> 
		        <div v-else class="col-5 mb-2"/>
		    </div>
		
		    <div class="row justify-content-around">
		        <div class="col-5 mb-2"/>
		        <div v-if="perfilCargado" class="card col-5 rounded-4 p-0 mb-2 shadow">
		            <div class="card-body">
		                <h2>Variables</h2>
		                <div class="col-md-6">
		                    <select class="form-select col-md-4" name="variables" v-model="variableSeleccionada">
		                        <option value="" disabled selected>Selecciona variable</option>
		                        <option v-for="variable in variables" :value="variable">{{variable.feature}}</option>
		                    </select>
		                </div>
		                <variables :variable="this.variableSeleccionada"/>
		            </div>
		        </div>
		    </div>
		</div>
	
	`
})