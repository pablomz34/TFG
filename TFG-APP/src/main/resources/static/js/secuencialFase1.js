
import {mixinFase1} from './abstractMixinsFases.js';


new Vue({
	el: "#secuencialFase1",
	mixins: [mixinFase1],
	data: function() {
		return {
			continuarButton: false
		}
	},

	methods: {
		getOptimalNClusters() {
			const THIZ = this;

			THIZ.mostrarCargando = true;

			THIZ.errorMessage = '';

			fetch(window.location.origin + "/admin/procesamientos/secuencial/getOptimalNClusters?maxClusters=" + this.maxClusters, {
				method: "POST"
			})
				.then(async res => {

					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.errorMessage = errorMessage;
						THIZ.mostrarCargando = false;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}

					return res.arrayBuffer();

				})
				.then(image_bytes => {

					const byteArray = new Uint8Array(image_bytes);
					const blob = new Blob([byteArray], { type: 'image/png' });
					const url = URL.createObjectURL(blob);
					THIZ.imagenCreada = true;
					THIZ.imagenUrl = url;
					THIZ.mostrarCargando = false;
					THIZ.continuarButton = true;
				})
				.catch(error => console.error(error))
		},
		siguienteFase() {
			
			const THIZ = this;

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
		    		    
		    
		    <div class="row col-md-6 offset-md-3">
		        <div class="card rounded-4 p-0 mb-2 shadow">
		            <div class="card-header rounded-4 rounded-bottom bg-custom-color bg-gradient bg-opacity-75">
		                <h2 class="text-center text-white">Nº Óptimo de Clusters</h2>
		            </div>
		            <div class="card-body">
		                <form @submit.prevent="getOptimalNClusters">
		                    <div class="form-group mb-3">
		                		<div class="input-container">
			                        <label class="input-container-label fw-bold" for="maxClusters">Nº de clusters</label>
			                        <input type="number" min="2" max="20" class="input-container-input pe-1" v-model="maxClusters" id="maxClusters" required />
		                    	</div>
		                    </div>
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
		    
		    <div v-if="continuarButton" class="row justify-content-center m-2">	
				<button type="button" @click="siguienteFase" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
			</div>
		    
		    <div class="row justify-content-around">
		        <div v-if="imagenCreada" class="card col-10 rounded-4 p-0 shadow">
		            <div class="card-body">
						<p><em>¡Imagen creada correctamente! Haz clic sobre ella para descargarla</em></p>
		                <a v-bind:href="imagenUrl" download="maxClustersImagen.png">
		                    <img id="imagenFase1" v-bind:src="imagenUrl" style="max-width: 100%;"/>
		                </a>
		            </div>
		        </div>
		    </div>
		</div>
	`
})