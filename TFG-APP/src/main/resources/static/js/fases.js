Vue.component('fase1', {
	data: function() {
		return {
			nClusters: '',
			csvFile: '',
			imagenCreada: false,
			imagenUrl: ''
		}
	},

	methods: {

		asyncGetOptimalNClusters() {
			const THIZ = this;
			const formData = new FormData();
			$('#cargando').show();
			formData.append('max_clusters', this.nClusters);
			formData.append('file', this.$refs.csvFile.files[0]);

			fetch(window.location.origin + "/admin/fases/getNClusters", {
				method: "POST",
				body: formData
			})
				.then(res => res.arrayBuffer())
				.then(image_bytes => {

					const byteArray = new Uint8Array(image_bytes);
					const blob = new Blob([byteArray], { type: 'image/png' });
					const url = URL.createObjectURL(blob);
					THIZ.imagenCreada = true;
					THIZ.imagenUrl = url;
					$('#cargando').hide();
				})
				.catch(err => console.log(err));
		}
	},


	template: `
	<div class="container col-md-12">
	
		<span>
			<div id="cargando" style="position:fixed; display:none; width: 100%; height: 100%; margin:0; padding:0; top:0; left:0; background:rgba(255,255,255,0.75);">
        		<img id="cargando" src="/images/cargando.gif" style="top:50%; left:50%; position: fixed; transform: translate(-50%, -50%);"/>
   			 </div>
		</span>
		
		<div class="col-md-6 p-2 m-3" style="border:1px solid black; border-radius:10px; padding:20px">
			<form @submit.prevent="asyncGetOptimalNClusters">				
				<div class="form-group col-md-4 pb-4">
					<label class="form-label" for="nClusters">Numero de clusters</label>
				    <input type="number" min=0 max=8 class="form-control" v-model="nClusters" id="nClusters">
				</div>
				
				<div class="form-group col-md-6 pb-4">
					<input type="file" accept=".csv" class="form-control-file" id="csv" ref="csvFile">
				</div>
				
				<button type="submit" class="btn btn-primary">Ejecutar</button>
			</form>
		</div>
		
		<div v-if="imagenCreada" class="col-md-10 p-2 m-3">
			<p><em>¡Imagen creada correctamente! Haz clic sobre ella para descargarla</em></p>
			<a v-bind:href="imagenUrl" download="nClustersImagen.png">
				<img id="imagenFase1" v-bind:src="imagenUrl" style="max-width:100%"/>
			</a>
		</div>
		
	</div>
	`
});

Vue.component('fase2', {
	data: function() {
		return {
			nClusteresAglomerativo: '',
			nClusteresKModes: '',
			csvFile: ''
		}
	},

	methods: {

		asyncGetSubPopulations() {
			const THIZ = this;
			const formData = new FormData();
			$('#cargando').show();
			formData.append('nClusteresAglomerativo', this.nClusteresAglomerativo);
			formData.append('nClusteresKModes', this.nClusteresKModes);
			formData.append('file', this.$refs.csvFile.files[0]);

			fetch(window.location.origin + "/admin/fases/getSubPopulations", {
				method: "POST",
				headers: {
					"Accept": "text/csv"
				},
				body: formData
			})
			.then(response => {
				// Verificar si la respuesta es OK
				if (!response.ok) {
					throw new Error('Ocurrió un error al descargar el archivo');
				}

				// Crear un objeto URL para el contenido del archivo
				return response.arrayBuffer();
			})
			.then(csv_bytes => {

				const byteArray = new Uint8Array(csv_bytes);
				const blob = new Blob([byteArray], { type: 'text/csv' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = 'SubPopulationsResponse.csv';

				// Agregar el enlace al DOM y hacer clic en él para descargar el archivo
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				$('#cargando').hide();
			})
			.catch(error => {
				console.error(error);
			});
		}
	},



	template: `
		<div class="container col-md-12">
		
			<span>
				<div id="cargando" style="position:fixed; display:none; width: 100%; height: 100%; margin:0; padding:0; top:0; left:0; background:rgba(255,255,255,0.75);">
	        		<img id="cargando" src="/images/cargando.gif" style="top:50%; left:50%; position: fixed; transform: translate(-50%, -50%);"/>
	   			 </div>
			</span>
			
			<div class="col-md-6 p-2 m-3" style="border:1px solid black; border-radius:10px; padding:20px">
				<form @submit.prevent="asyncGetSubPopulations">				
					<div class="form-group col-md-4 pb-4">
						<label class="form-label" for="nClusters">Numero de clústeres del algoritmo aglomerativo</label>
					    <input type="number" min=0 max=4 class="form-control" v-model="nClusteresAglomerativo" id="nClusteresAglomerativo">
					</div>
					
					<div class="form-group col-md-4 pb-4">
						<label class="form-label" for="nClusters">Numero de clústeres del algoritmo kmodes</label>
					    <input type="number" min=0 max=4 class="form-control" v-model="nClusteresKModes" id="nClusteresKModes">
					</div>
					
					<div class="form-group col-md-6 pb-4">
						<input type="file" accept=".csv" class="form-control-file" id="csv" ref="csvFile">
					</div>
					
					<button type="submit" class="btn btn-primary">Calcular clústeres</button>
				</form>
			</div>
			
		</div>
	`
});

Vue.component('fase3', {
	data: function() {
		return {
			lista: [],
			headers: [{ header: "Metric", pos: 0 }, { header: "Tss_value", pos: 1 }, { header: "Total_wc", pos: 2 }, { header: "Total_bc", pos: 3 }],
			datosCargados: false
		}
	},

	methods: {
		asyncGetVarianceMetrics: function() {
			const THIZ = this;
			const formData = new FormData();
			$('#cargando').show();
			formData.append('file', this.$refs.csvFile.files[0]);

			fetch(window.location.origin + "/admin/fases/getVarianceMetrics", {
				method: "POST",
				body: formData
			})
			.then(response => response.json())
			.then(data =>{
				for(i=0, j=1; j<data.length; i++,j++) THIZ.lista[i] = data[j]
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
	
		<div class="col-md-6 p-2 m-3" style="border:1px solid black; border-radius:10px; padding:20px">
			<form @submit.prevent="asyncGetVarianceMetrics">						
				<div class="form-group col-md-6 pb-4">
					<input type="file" accept=".csv" class="form-control-file" id="csv" ref="csvFile">
				</div>	
				
				<button type="submit" class="btn btn-primary">Ejecutar</button>
			</form>
		</div>
		
		<table v-if="datosCargados" class="table table-bordered table-hover p-2 m-3">
			<thead class="table-dark">
				<tr>
					<th v-for="head in headers"> 
					{{head.header}}
					</th>
				</tr>
			</thead>
			
			<tbody>
				<tr v-for="i in lista">
					<td>{{i.metric}}</td>
					<td>{{i.tss_value}}</td>
					<td>{{i.total_wc}}</td>
					<td>{{i.total_bc}}</td>
				</tr>
			</tbody>
		</table>
		
	</div>
	`
});

Vue.component('fase4', {
	data: function() {
		return {
			nombreFase: 'Fase4',
		}
	},



	template: `
	<div>
		<p>{{nombreFase}}</p>
	</div>
	
	`

});

Vue.component('fase5', {
	data: function() {
		return {
			list: [],
			headers: [{ header: "Nombre", pos: 0 }, { header: "Apellidos", pos: 1 }, { header: "Correo", pos: 2 }, { header: "Dni", pos: 3 }]
		}
	},



	created() {
		const THIZ = this;
		$.ajax({
			type: 'GET',
			url: window.location.origin + '/admin/fases/getMedicos',
			success: function(data) {
				for (let i = 0; i < data.length; i++) THIZ.list.push(data[i]);

			},
			error: function(error) {
				console.log(error);
			}
		});
	},

	template: `
	<div class="pt-2">
		<table class="table table-bordered table-hover">
			<thead class="table-dark">
				<tr>
					<th v-for="head in headers"> 
					{{head.header}}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="i in list">
					<td>{{i.nombre}}</td>
					<td>{{i.apellidos}}</td>
					<td>{{i.correo}}</td>
					<td>{{i.dni}}</td>
				</tr>
			</tbody>
		</table>
	</div>
	
	`

});

new Vue({
	el: "#fases",
	data: function() {
		return {
			seleccion: '',
		}
	},

	methods: {
		cambiarSeleccion(seleccion) {
			const THIZ = this;
			THIZ.seleccion = seleccion;
		},

		colorTexto(seleccion) {
			if (seleccion === this.seleccion) return 'white';
			else return 'black';
		},

		colorBoton(seleccion) {
			if (seleccion === this.seleccion) return '#0D6EFD';
			else return '#AACDFF'
		},
		
		linea(seleccion) {
			if (seleccion === this.seleccion) return '2px solid';
			else return '1px solid';
		},
	},


	template: `
		<div class="container pt-2">		
		    <div class="row col-md-10">
				<h2>Fases</h2>
			</div>
        	<div class="form-group col-md-12">
                <button @click="cambiarSeleccion('Fase1')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase1'), border: linea('Fase1')}">
                    <span :style="{color: colorTexto('Fase1')}">Fase 1</span> 
                </button>
                <button @click="cambiarSeleccion('Fase2')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase2'), border: linea('Fase2')}">
                    <span :style="{color: colorTexto('Fase2')}">Fase 2</span>
                </button>
                <button @click="cambiarSeleccion('Fase3')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase3'), border: linea('Fase3')}">
                    <span :style="{color: colorTexto('Fase3')}">Fase 3</span>
                </button>
                <button @click="cambiarSeleccion('Fase4')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase4'), border: linea('Fase4')}">
                    <span :style="{color: colorTexto('Fase4')}">Fase 4</span>
                </button>
                <button @click="cambiarSeleccion('Fase5')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase5'), border: linea('Fase5')}">
                    <span :style="{color: colorTexto('Fase5')}">Fase 5</span>
                </button>
        	</div>	    
        	
        	<fase1 v-if="seleccion==='Fase1'"/>
        	<fase2 v-if="seleccion==='Fase2'"/>
            <fase3 v-if="seleccion==='Fase3'"/>     
            <fase4 v-if="seleccion==='Fase4'"/>  
            <fase5 v-if="seleccion==='Fase5'"/>   
                
		</div>`
})