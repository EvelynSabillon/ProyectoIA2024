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

async function buscarImagenes(lugar, tipoTurismo, lat, lng) {
    console.log("Revisando lugar:", lugar); // Para ver qué recibimos

    // 1. Verificar si hay imagen_url y si es válida
    if (lugar.image_url && lugar.image_url !== "No disponible") {
        try {
            const cleanUrl = decodeURIComponent(lugar.image_url.replace(/\\/g, ''));
            console.log('URL del JSON encontrada:', cleanUrl);
            
            // Remover la verificación fetch que puede estar causando el problema
            return cleanUrl;
            
        } catch (error) {
            console.warn(`Error con imagen original:`, error);
        }
    }

    console.log('Usando Unsplash para:', lugar.nombre);

    // 2. Si no hay imagen válida en el JSON, usar Unsplash
    try {
        // Construir una query exacta
        const lugar_limpio = lugar.nombre
            .replace(/[^\w\s]/gi, '') // remover caracteres especiales
            .toLowerCase();
            
        let query = lugar.nombre;
        
        // Términos específicos para lugares famosos
        const lugares_especificos = {
            // Europa
            'eiffel tower': 'Eiffel Tower Paris France landmark iconic',
            'louvre museum': 'Louvre Museum Paris pyramid art museum',
            'arc de triomphe': 'Arc de Triomphe Paris France monument',
            'notre dame cathedral': 'Notre Dame Cathedral Paris Gothic architecture',
            'sagrada familia': 'Sagrada Familia Barcelona Gaudi cathedral',
            'park guell': 'Park Guell Barcelona Gaudi mosaic architecture',
            'casa batllo': 'Casa Batllo Barcelona Gaudi modernist building',
            'colosseum': 'Colosseum Rome Italy ancient amphitheater',
            'vatican museums': 'Vatican Museums Rome Sistine Chapel art',
            'trevi fountain': 'Trevi Fountain Rome Italy baroque fountain',
            'pantheon rome': 'Pantheon Rome Italy ancient temple dome',
            'big ben': 'Big Ben London Parliament iconic clock tower',
            'tower bridge': 'Tower Bridge London Thames iconic bridge',
            'london eye': 'London Eye Thames River observation wheel',
            'buckingham palace': 'Buckingham Palace London royal residence',
            'stonehenge': 'Stonehenge England prehistoric monument sunrise',
            'acropolis athens': 'Acropolis Athens Greece Parthenon ancient',
            'santorini': 'Santorini Greece white buildings blue domes',
            'neuschwanstein castle': 'Neuschwanstein Castle Bavaria Germany fairytale',
            'brandenburg gate': 'Brandenburg Gate Berlin Germany historic landmark',
            
            // Asia
            'taj mahal': 'Taj Mahal Agra India marble mausoleum sunrise',
            'great wall china': 'Great Wall of China mountains historic wall',
            'forbidden city': 'Forbidden City Beijing China imperial palace',
            'mount fuji': 'Mount Fuji Japan snow capped mountain landscape',
            'shibuya crossing': 'Shibuya Crossing Tokyo Japan pedestrian crossing',
            'tokyo tower': 'Tokyo Tower Japan red tower night illuminated',
            'senso ji temple': 'Senso-ji Temple Asakusa Tokyo oldest temple',
            'fushimi inari': 'Fushimi Inari Shrine Kyoto red torii gates',
            'petronas towers': 'Petronas Towers Kuala Lumpur Malaysia twin towers',
            'angkor wat': 'Angkor Wat Cambodia temple sunrise reflection',
            'marina bay sands': 'Marina Bay Sands Singapore hotel infinity pool',
            'gardens by the bay': 'Gardens by the Bay Singapore Supertree Grove',
            'grand palace bangkok': 'Grand Palace Bangkok Thailand ornate temple',
            'burj khalifa': 'Burj Khalifa Dubai tallest building night',
            'palm jumeirah': 'Palm Jumeirah Dubai aerial artificial island',
            
            // América
            'statue of liberty': 'Statue of Liberty New York Harbor landmark',
            'times square': 'Times Square New York City night lights billboards',
            'central park': 'Central Park New York aerial green space',
            'empire state building': 'Empire State Building New York Art Deco skyscraper',
            'brooklyn bridge': 'Brooklyn Bridge New York City suspension bridge',
            'golden gate bridge': 'Golden Gate Bridge San Francisco fog iconic',
            'hollywood sign': 'Hollywood Sign Los Angeles hills landmark',
            'grand canyon': 'Grand Canyon Arizona USA natural wonder vista',
            'niagara falls': 'Niagara Falls waterfall powerful mist',
            'christ the redeemer': 'Christ the Redeemer Rio Janeiro Brazil statue',
            'machu picchu': 'Machu Picchu Peru Inca ruins mountains',
            'perito moreno': 'Perito Moreno Glacier Argentina ice nature',
            'iguazu falls': 'Iguazu Falls Argentina Brazil waterfall nature',
            'easter island': 'Easter Island Chile moai statues sunset',
            
            // África
            'pyramids giza': 'Pyramids of Giza Egypt ancient desert sphinx',
            'victoria falls': 'Victoria Falls Zimbabwe Zambia waterfall rainbow',
            'table mountain': 'Table Mountain Cape Town South Africa landmark',
            'kilimanjaro': 'Mount Kilimanjaro Tanzania Africa highest peak',
            'medina marrakech': 'Medina of Marrakech Morocco souk market',
            
            // Australia y Oceanía
            'sydney opera house': 'Sydney Opera House Australia harbour iconic',
            'uluru': 'Uluru Ayers Rock Australia red desert sunrise',
            'great barrier reef': 'Great Barrier Reef Australia coral aerial',
            'twelve apostles': 'Twelve Apostles Australia rock formations coast',
            'milford sound': 'Milford Sound New Zealand fjord nature',
            
            // Catedrales y Basílicas
            'st peters basilica': 'St Peters Basilica Vatican Rome largest church',
            'milan cathedral': 'Milan Cathedral Italy Gothic architecture',
            'cologne cathedral': 'Cologne Cathedral Germany Gothic spires',
            'st pauls cathedral': 'St Pauls Cathedral London dome architecture',
            'westminster abbey': 'Westminster Abbey London Gothic church royal',
            
            // Museos Famosos
            'british museum': 'British Museum London historic collection entrance',
            'orsay museum': 'Musee d Orsay Paris France art museum clock',
            'prado museum': 'Prado Museum Madrid Spain art gallery facade',
            'uffizi gallery': 'Uffizi Gallery Florence Italy art museum',
            
            // Plazas Famosas
            'st marks square': 'St Marks Square Venice Italy piazza basilica',
            'red square': 'Red Square Moscow Russia Saint Basil Cathedral',
            'dam square': 'Dam Square Amsterdam Netherlands Royal Palace',
            'grand place brussels': 'Grand Place Brussels Belgium gothic square',
            
            // Castillos
            'palace versailles': 'Palace of Versailles France royal garden',
            'edinburgh castle': 'Edinburgh Castle Scotland fortress rock',
            'prague castle': 'Prague Castle Czech Republic largest castle',
            'chambord castle': 'Chateau de Chambord Loire Valley France',
            
            // Parques Nacionales
            'yellowstone': 'Yellowstone National Park geysers nature USA',
            'yosemite': 'Yosemite National Park California granite cliffs',
            'torres del paine': 'Torres del Paine Chile mountains peaks',
            'banff': 'Banff National Park Canada rocky mountains lake',
            
            // Sitios Arqueológicos
            'petra': 'Petra Jordan Treasury ancient architecture',
            'chichen itza': 'Chichen Itza Mexico Mayan pyramid temple',
            'pompeii': 'Pompeii Italy Roman ruins volcano archaeology',
            'ephesus': 'Ephesus Turkey ancient Greek Roman ruins',
            
            // Jardines y Parques
            'keukenhof': 'Keukenhof Gardens Netherlands tulips spring',
            'boboli gardens': 'Boboli Gardens Florence Italy renaissance garden',
            'central park': 'Central Park New York City green space aerial',
            'english garden munich': 'English Garden Munich Germany park lake',
            
            // Sitios Naturales
            'northern lights': 'Aurora Borealis Iceland Northern Lights night',
            'zhangjiajie': 'Zhangjiajie China Avatar mountains forest',
            'salar de uyuni': 'Salar de Uyuni Bolivia salt flat reflection',
            'blue grotto': 'Blue Grotto Capri Italy sea cave azure',
            
            // Modernos
            'palm jumeirah': 'Palm Jumeirah Dubai UAE aerial island',
            'gardens by the bay': 'Gardens by the Bay Singapore Supertree night',
            'the shard': 'The Shard London modern architecture glass',
            'cn tower': 'CN Tower Toronto Canada observation deck',
            
            // Sitios Históricos
            'forbidden city': 'Forbidden City Beijing China imperial palace',
            'terracotta warriors': 'Terracotta Warriors Xian China ancient army',
            'palace of doge': 'Doges Palace Venice Italy gothic architecture',
            'alcazar seville': 'Real Alcazar Seville Spain moorish palace',
            
            // Mercados
            'grand bazaar istanbul': 'Grand Bazaar Istanbul Turkey market historic',
            'chatuchak': 'Chatuchak Weekend Market Bangkok Thailand',
            'borough market': 'Borough Market London food historic market',
            'la boqueria': 'La Boqueria Barcelona Spain food market',
            
            // Islas
            'santorini': 'Santorini Greece white buildings caldera sunset',
            'bora bora': 'Bora Bora French Polynesia overwater bungalows',
            'maldives': 'Maldives Indian Ocean overwater villas turquoise',
            'capri': 'Capri Italy Mediterranean island blue grotto',
            
            // Sitios Religiosos
            'hagia sophia': 'Hagia Sophia Istanbul Turkey mosque museum',
            'temple of heaven': 'Temple of Heaven Beijing China architecture',
            'golden temple': 'Golden Temple Amritsar India sikh temple',
            'mont saint michel': 'Mont Saint Michel France abbey island',
            
            // Puentes Famosos
            'charles bridge': 'Charles Bridge Prague Czech Republic historic',
            'ponte vecchio': 'Ponte Vecchio Florence Italy medieval bridge',
            'rialto bridge': 'Rialto Bridge Venice Italy grand canal',
            'sydney harbour bridge': 'Sydney Harbour Bridge Australia coat hanger',
            
            // Otros Monumentos
            'moai': 'Easter Island Moai statues sunset Chile',
            'little mermaid': 'Little Mermaid Copenhagen Denmark statue',
            'manneken pis': 'Manneken Pis Brussels Belgium fountain statue',
            'space needle': 'Space Needle Seattle Washington landmark'
        };

        // Si es un lugar famoso, usar términos específicos
        for (const [key, value] of Object.entries(lugares_especificos)) {
            if (lugar_limpio.includes(key)) {
                query = value;
                break;
            }
        }

        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&client_id=${ACCESS_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            // Tomar la primera imagen que suele ser la más relevante
            return data.results[0].urls.regular;
        }
    } catch (error) {
        console.error('Error con Unsplash:', error);
    }
    
    return '/img/placeholder.jpg';
}

export default buscarImagenes;

async function mostrarRecomendaciones(recomendaciones) {
    const container = document.getElementById('recomendaciones');
    container.innerHTML = '';
    
    console.log('Recomendaciones recibidas:', recomendaciones); // Para debug
    
    if (recomendaciones.length === 0) {
        container.innerHTML = `
            <div class="card-recomendacion">
                <div class="card-recomendacion-content">
                    <h3>No se encontraron destinos</h3>
                    <p>Intenta ajustando los criterios de búsqueda.</p>
                </div>
            </div>
        `;
        return;
    }

    // Iterar sobre las recomendaciones
    for (const lugar of recomendaciones) {
        try {
            // Obtener la imagen del lugar
            const imagen = await buscarImagenes(lugar);

            // Crear la tarjeta de recomendación
            const card = document.createElement('div');
            card.className = 'card-recomendacion';

            card.innerHTML = `
                <img src="${imagen}" alt="${lugar.nombre}" onerror="this.src='/img/placeholder.jpg'">
                <div class="card-recomendacion-content">
                    <h3>${lugar.nombre}</h3>
                    <p><strong>Tipo:</strong> ${lugar.tipoTurismo}</p>
                    <p><strong>Calificación:</strong> ${getStars(lugar.calificacion)} (${lugar.calificacion.toFixed(1)})</p>
                    <p><strong>Precio estimado:</strong> $${lugar.precio}</p>
                </div>
            `;

            // Añadir la tarjeta al contenedor
            container.appendChild(card);
        } catch (error) {
            console.error(`Error al crear tarjeta para ${lugar.nombre}:`, error);
        }
    }

    // Mostrar el contenedor de recomendaciones
    container.classList.add('visible');
}

function getStars(calificacion) {
    const fullStar = '<span class="stars full">★</span>'; // Estrella llena
    const halfStar = '<span class="stars half">☆</span>'; // Estrella media
    const emptyStar = '<span class="stars empty">☆</span>'; // Estrella vacía
    let stars = '';
    // Agregar estrellas llenas
    for (let i = 0; i < Math.floor(calificacion); i++) {
        stars += fullStar;
    }

    // Agregar estrella media si hay un decimal
    if (calificacion % 1 >= 0.5) {
        stars += halfStar; // Agrega una estrella media
    }

    // Agregar estrellas vacías
    for (let i = Math.ceil(calificacion); i < 5; i++) {
        stars += emptyStar;
    }

    return stars;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeRecommender);
