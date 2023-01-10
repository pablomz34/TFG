Vue.component('adios', {

	data: function() {
		return {
			mensaje: 'adios'
		};
	},

	template: `
    <div>
		  <p>{{mensaje}}</p>
	</div>`
});

new Vue({
	el: '#index',
	data: function() {
		return {
			lines: [],
			seleccion: '',
			headers: [{header: 'Nombre', pos: 0}, {header: 'Apellidos', pos: 1}, {header:'DNI', pos: 2}]
		};
	},
	
	created(){
		const THIZ = this;
		$.ajax({
			type: 'GET',
			url: 'http://localhost:8080/administradores/getAll',
			success: function(data) {
				for(let i = 0; i < data.length; i++){
					THIZ.lines.push(data[i]);
				}
			},
			error: function(error) {
				console.log("error")
			}
		}); 
	},

	template: `
	<div>
    	<div class="row justify-content-md-center" style="margin-top:2%; margin-bottom:2%">
	        <div class="col-md-auto" style="text-align:center">
	        	<div class="modal-content">  
	                <form class="col-sm-12">
	                    <button type="submit" class="btn btn-primary">Administrador</button>               
	                </form> 
	                 
					<form class="col-sm-12">
	                    <button type="submit" class="btn btn-primary">Médico</button>      
	                </form>     
	            </div>
	        </div>
    	</div>
   
		<div v-if="lines.length" class="col align-center" style="padding-left:10%; padding-right:10%">
        	<table class="table table-striped">
	        	<thead>
					<tr>
						<th v-for="head in headers"  style="text-align: center; position: sticky; top: 0; white-space: nowrap; height: 35"> 
		        			{{head.header}} 
		    			</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="i in lines">
						<td v-for="head in headers" style="text-align: center"> {{Object.values(i)[head.pos]}} </td>
					</tr>
				</tbody>
			</table>
        </div>   
    </div>
    
    `
});