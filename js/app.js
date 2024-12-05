// app.js
import TravelRecommender from './model.js';

let recommender = null;

// Cargar los datos y centroides
async function initializeRecommender() {
    try {
        const response = await fetch('js/data.json');
        const data = await response.json();
        
        // Centroides pre-calculados del modelo Python (ajustar según tus datos)
        const centroids = [
            [4.5, 200, 1, 0, 1, 0, 0, 0, 0],
            [4.2, 150, 0, 1, 1, 1, 0, 0, 0],
            [4.8, 300, 1, 1, 1, 0, 0, 1, 0],
            [4.0, 175, 0, 0, 1, 1, 1, 0, 0],
            [4.6, 250, 1, 1, 0, 0, 0, 0, 1],
            [4.3, 225, 0, 1, 1, 0, 0, 1, 0],
            [4.7, 275, 1, 0, 1, 1, 0, 0, 0],
            [4.4, 190, 0, 1, 0, 0, 1, 1, 0]
        ];

        recommender = new TravelRecommender(data, centroids);
        
        // Configurar los event listeners después de cargar los datos
        setupEventListeners();
        
    } catch (error) {
        console.error('Error al inicializar el recomendador:', error);
    }
}

function setupEventListeners() {
    const regionSelect = document.getElementById('region');
    const paisSelect = document.getElementById('pais');
    const form = document.getElementById('recommendationForm');

    // Actualizar países cuando cambia la región
    regionSelect.addEventListener('change', () => {
        const selectedRegion = regionSelect.value;
        const paises = recommender.getCountriesForRegion(selectedRegion);
        
        paisSelect.innerHTML = '<option value="">Selecciona un país</option>';
        paises.forEach(pais => {
            const option = document.createElement('option');
            option.value = pais;
            option.textContent = pais;
            paisSelect.appendChild(option);
        });
    });

    // Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const datos = {
            region: formData.get('region'),
            pais: formData.get('pais'),
            tipoTurismo: formData.get('tipoTurismo'),
            presupuesto: parseFloat(formData.get('presupuesto'))
        };

        if (!recommender) {
            alert('El sistema está cargando. Por favor, espera un momento.');
            return;
        }

        const recomendaciones = recommender.recomendar(
            datos.region,
            datos.pais,
            datos.tipoTurismo,
            datos.presupuesto
        );

        mostrarRecomendaciones(recomendaciones);
    });
}

function mostrarRecomendaciones(recomendaciones) {
    const container = document.getElementById('recomendaciones');
    container.innerHTML = '';
    
    if (recomendaciones.length === 0) {
        container.innerHTML = `
            <div class="card">
                <p>No se encontraron lugares que coincidan con tus criterios.</p>
                <p>Intenta ajustando el presupuesto o cambiando el tipo de turismo.</p>
            </div>
        `;
        return;
    }

    recomendaciones.forEach(lugar => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const imagen = lugar.fotoUrl && lugar.fotoUrl !== 'No disponible' 
            ? lugar.fotoUrl 
            : './img/placeholder.jpg';

        card.innerHTML = `
            <img src="${imagen}" alt="${lugar.nombre}" class="card-icon">
            <h2>${lugar.nombre}</h2>
            <p>Tipo: ${lugar.tipoTurismo}</p>
            <p>Calificación: ${lugar.calificacion.toFixed(1)}/5.0</p>
            <p>Precio: $${lugar.precio}</p>
        `;
        
        container.appendChild(card);
    });

    container.classList.add('visible');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeRecommender);