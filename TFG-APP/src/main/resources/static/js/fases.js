Vue.component('fase1', {
	data: function() {
		return {
			nombreFase: 'Fase1',
			algoritmos: ['K', 'M', 'H', 'A'],
			algoritmo: '',
			nClusters: '',
			csv: '',
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

		asyncGetNClusters: function() {
			const THIZ = this;
			const formData = new FormData();

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
				})	
				.catch(err => console.log(err));
				
				
		}
	},


	template: `
	<div>
		<p>{{nombreFase}}</p>
		
			<form @submit.prevent="asyncGetNClusters">				
		 	<!--<div class="form-group col-md-6 pb-4">
				<label class="form-label" for="algoritmo">Tipo de algoritmo</label>
				<select v-model="algoritmo" class="form-control" id="algoritmo">
					<option value="" disabled selected>Selecciona un tipo de algoritmo</option>
					<option v-for="a in algoritmos">{{a}}</option>
				</select>
			</div>-->
			
			<div class="form-group col-md-6 pb-4">
				<label class="form-label" for="nClusters">Numero de clusters</label>
			    <input type="number" min=0 max=8 class="form-control" v-model="nClusters" id="nClusters">
			</div>
			
			<div class="form-group col-md-6 pb-4">
				<input type="file" accept=".csv" class="form-control-file" id="csv" ref="csvFile">
			</div>
			
			<button type="submit" class="btn btn-primary">Ejecutar</button>
			
			<div v-if="imagenCreada">
				<img id="imagenFase1" v-bind:src="imagenUrl"/>
			</div>
			
		</form>
		
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