Vue.component('fase1', {
	data: function() {
		return {
			nombreFase: 'Fase1',
			nClusters: '',
			csvFile: '',
			nClustersFile: '',
			imagenCreada: false,
			imagenUrl: ''
		}
	},

	methods: {
		asincHolaMundo: function() {
			fetch(window.location.origin + "/fases/getHelloApi")
				.then(response => response.json())
				.then(data => console.log(data))
				.catch(error => console.error(error));
			/*$.ajax({
				url: window.location.origin + '/fases/getHelloApi',
				type: 'GET',
				success: function (response) {
					console.log(response);
				},
				error: function () {
					alert('Failed!');
				},
			})*/
		},

		asyncGetOptimalNClusters() {
			const THIZ = this;
			const formData = new FormData();
			$('#cargando').show();
			formData.append('max_clusters', this.nClusters);
			formData.append('file', this.$refs.csvFile.files[0]);

			fetch(window.location.origin + "/fases/getNClusters", {
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
		<button class="btn btn-primary" @click="asincHolaMundo"/>
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
			nombreFase: 'Fase2',
			list: [],
			headers: [{ header: "Nombre", pos: 0 }, { header: "Apellidos", pos: 1 }, { header: "Correo", pos: 2 }, { header: "Dni", pos: 3 }]
		}
	},



	created() {
		const THIZ = this;
		$.ajax({
			type: 'GET',
			url: window.location.origin + '/fases/getMedicos',
			success: function(data) {
				for (let i = 0; i < data.length; i++) THIZ.list.push(data[i]);

			},
			error: function(error) {
				console.log("error");
			}
		});
	},

	template: `
	<div>
		<p>{{nombreFase}}</p>
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

Vue.component('fase3', {
	data: function() {
		return {
			nombreFase: 'Fase3',
		}
	},



	template: `
	<div>
		<p>{{nombreFase}}</p>
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
			nombreFase: 'Fase5',
		}
	},



	template: `
	<div>
		<p>{{nombreFase}}</p>
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
			if (seleccion === this.seleccion) return '#5bc0de';

		},
	},


	template: `
		<div class="container" style="padding-top:1%">		
		    <div class="row col-md-10">
				<h2>Fases</h2>
			</div>
        	<div class="form-group col-md-12">
                <button @click="cambiarSeleccion('Fase1')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase1')}" style="border-color: #FAFAFA; border: 1px solid">
                    <span :style="{color: colorTexto('Fase1')}">Fase 1</span> 
                </button>
                <button @click="cambiarSeleccion('Fase2')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase2')}" style="border-color: #FAFAFA; border: 1px solid">
                    <span :style="{color: colorTexto('Fase2')}">Fase 2</span>
                </button>
                <button @click="cambiarSeleccion('Fase3')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase3')}" style="border-color: #FAFAFA; border: 1px solid">
                    <span :style="{color: colorTexto('Fase3')}">Fase 3</span>
                </button>
                <button @click="cambiarSeleccion('Fase4')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase4')}" style="border-color: #FAFAFA; border: 1px solid">
                    <span :style="{color: colorTexto('Fase4')}">Fase 4</span>
                </button>
                <button @click="cambiarSeleccion('Fase5')" type="button" class="btn btn-md col-md-2" :style="{backgroundColor: colorBoton('Fase5')}" style="border-color: #FAFAFA; border: 1px solid">
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