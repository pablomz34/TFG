new Vue({
	el: "#seleccionarModoDeProcesamiento",
	data: function() {
		return {
			selectedIdCard: '',
			modoProcesamiento: '',
			errorMessage: ''
		}
	},
	methods: {
		seleccionarCard(idCard, modoProcesamiento) {

			const THIZ = this;

			let cardToSelect = document.getElementById(idCard);

			if (THIZ.selectedIdCard.length === 0) {

				this.appendCardStyles(idCard);

				THIZ.selectedIdCard = idCard;
			}
			else {

				let cardSelected = document.getElementById(THIZ.selectedIdCard);

				if (cardToSelect.getAttribute('id') !== cardSelected.getAttribute('id')) {

					this.resetearSelectedCardStyles(THIZ.selectedIdCard);

					this.appendCardStyles(idCard);

					THIZ.selectedIdCard = idCard;

				}
			}

			THIZ.modoProcesamiento = modoProcesamiento;

		},
		appendCardStyles(toSelectIdCard) {

			let cardToSelect = document.getElementById(toSelectIdCard);

			let cardToSelectIcon = document.createElement("i");

			cardToSelect.setAttribute("style", "border: 5px solid rgb(123, 154, 234); box-shadow: 8px 8px 16px 4px rgb(123, 154, 234);");

			cardToSelectIcon.setAttribute("class", "fases-card-selected-icon fa-solid fa-circle-check");

			cardToSelect.append(cardToSelectIcon);
		},

		resetearSelectedCardStyles(selectedIdCard) {

			let cardSelected = document.getElementById(selectedIdCard);

			cardSelected.removeChild(cardSelected.lastChild);

			cardSelected.setAttribute("style", "");
		},
		seleccionarModoDeProcesamiento() {
				
			const THIZ = this;
			
			THIZ.errorMessage = '';
			
			fetch(window.location.origin + "/admin/redigirAProcesamiento?modoProcesamiento=" + this.modoProcesamiento, {
				method: "POST"
			})
				.then(async res => {
					if (!res.ok) { // Verificar si la respuesta no es exitosa (código de estado HTTP diferente de 200)
						const errorMessage = await res.text();
						THIZ.errorMessage = errorMessage;
						throw new Error("Error: " + res.status + " " + res.statusText + " - " + errorMessage);
					}
					return res.text();
				})
				.then(url => {

					window.location.href = url;
				})
				.catch(error => console.error(error));

		}
	},
	template: `
		<div class="container-fluid pt-2">
		
			<div class="row justify-content-center mt-3">
				<div v-if="errorMessage != ''" class="col-md-5">
					<div class="alert alert-danger alert-dismissible fade show" role="alert">
						{{errorMessage}}
						<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
					</div>
				</div>
			</div>
	
			<div class="row justify-content-around" style="margin-top: 65px;">
	
				<div class="col-md-4 mb-5">
					<div class="row justify-content-center">
						<div id="card1" class="fases-card" @click="seleccionarCard('card1', 0)">
							<i class="fases-card-i fa-solid fa-gears"></i>
							<p class="fases-card-p text-center mb-0">Procesamiento secuencial y automatizado</p>
						</div>
					</div>
				</div>
	
				<div class="col-md-4 mb-5">
					<div class="row justify-content-center">
						<div id="card2" class="fases-card" @click="seleccionarCard('card2', 1)">
							<i class="fases-card-i fa-solid fa-user-gear"></i>
							<p class="fases-card-p text-center mb-0">Procesamiento no secuencial y manual</p>
						</div>
					</div>
				</div>
			</div>
			
			<div v-if="selectedIdCard != ''" class="row justify-content-center">	
					<button type="button" @click="seleccionarModoDeProcesamiento" class="next-button">Continuar <i class="fa-solid fa-arrow-right next-button-i"></i></button>	
			</div>
			
		</div>
	`
})