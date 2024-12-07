// app.js
import TravelRecommender from './model.js';

let recommender = null;

const ACCESS_KEY = '2cmDGYcpKM2Hexq8AZjD2GE34qKwY_l96jxElLXbUEw'; 

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
    const ciudadSelect = document.getElementById('ciudad');
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

        ciudadSelect.innerHTML = '<option value="">Selecciona una ciudad</option>';
    });

    // Actualizar ciudades cuando cambia el país
    paisSelect.addEventListener('change', () => {
        const selectedCountry = paisSelect.value;
        const ciudades = recommender.getCitiesForCountry(selectedCountry);

        ciudadSelect.innerHTML = '<option value="">Selecciona una ciudad</option>';
        ciudades.forEach(ciudad => {
            const option = document.createElement('option');
            option.value = ciudad;
            option.textContent = ciudad;
            ciudadSelect.appendChild(option);
        });
    });

    // Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const datos = {
            region: formData.get('region'),
            pais: formData.get('pais'),
            ciudad: formData.get('ciudad'),
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
            datos.ciudad,
            datos.tipoTurismo,
            datos.presupuesto
        );

        mostrarRecomendaciones(recomendaciones);

        //Desplazar el formulario hacia la izquierda
        const formContainer = document.querySelector('.form-container');
        formContainer.classList.add('slide-left');

    });
}


async function buscarImagenes(lugar) {
    const url = `https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(lugar)}&client_id=${ACCESS_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results.length > 0) {
            return data.results[0].urls.small; // Retorna la URL de la primera imagen encontrada
        } else {
            return './img/placeholder.jpg'; // Imagen predeterminada si no hay resultados
        }
    } catch (error) {
        console.error('Error al buscar imágenes:', error);
        return './img/placeholder.jpg'; // Imagen predeterminada en caso de error
    }
}


async function mostrarRecomendaciones(recomendaciones) {
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

    // Iterar sobre las recomendaciones
    for (const lugar of recomendaciones) {
        // Obtener la imagen del lugar desde la API de Unsplash
        const imagen = await buscarImagenes(lugar.nombre);

        // Crear la tarjeta de recomendación
        const card = document.createElement('div');
        card.className = 'card-recomendacion';

        card.innerHTML = `
            <img src="${imagen}" alt="${lugar.nombre}">
            <div class="card-recomendacion-content">
                <h3>${lugar.nombre}</h3>
                <p>Tipo: ${lugar.tipoTurismo}</p>
                <p>Calificación: ${lugar.calificacion.toFixed(1)}/5.0</p>
                <p>Precio: $${lugar.precio}</p>
            </div>
        `;

        // Añadir la tarjeta al contenedor
        container.appendChild(card);
    }

    // Mostrar el contenedor de recomendaciones
    container.classList.add('visible');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeRecommender);