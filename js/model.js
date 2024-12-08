// model.js
class TravelRecommender {
    constructor(data, centroids) {
        this.data = data;
        this.centroids = centroids;
        this.countryByRegion = this.organizeCountriesByRegion();
        this.cityByCountry = this.organizeCitiesByCountry();
    }

    organizeCountriesByRegion() {
        const regionMap = {};
        this.data.forEach(place => {
            Object.keys(place).forEach(key => {
                if (key.startsWith('region_') && place[key] === 1) {
                    const region = key.replace('region_', '');
                    if (!regionMap[region]) regionMap[region] = new Set();
                    
                    Object.keys(place).forEach(countryKey => {
                        if (countryKey.startsWith('pais_') && place[countryKey] === 1) {
                            regionMap[region].add(countryKey.replace('pais_', ''));
                        }
                    });
                }
            });
        });
        
        // Convertir Sets a arrays ordenados
        Object.keys(regionMap).forEach(region => {
            regionMap[region] = Array.from(regionMap[region]).sort();
        });
        
        return regionMap;
    }

    organizeCitiesByCountry() {
        const cityMap = {};
        this.data.forEach(place => {
            Object.keys(place).forEach(key => {
                if (key.startsWith('pais_') && place[key] === 1) {
                    const country = key.replace('pais_', '');
                    if (!cityMap[country]) cityMap[country] = new Set();

                    Object.keys(place).forEach(cityKey => {
                        if (cityKey.startsWith('ciudad_') && place[cityKey] === 1) {
                            cityMap[country].add(cityKey.replace('ciudad_', ''));
                        }
                    });
                }
            });
        });

        // Convertir Sets a arrays ordenados
        Object.keys(cityMap).forEach(country => {
            cityMap[country] = Array.from(cityMap[country]).sort();
        });

        return cityMap;
    }

    getCountriesForRegion(region) {
        return this.countryByRegion[region] || [];
    }

    getCitiesForCountry(country) {
        return this.cityByCountry[country] || [];
    }

    standardizeFeatures(lugar) {
        // Extraer características relevantes en el mismo orden que el training
        const features = [
            lugar.Calificación,
            lugar.Precio,
            lugar.Relajación || 0,
            lugar.Aventura || 0,
            lugar.Cultural || 0,
            lugar.Histórico || 0,
            lugar.Espiritual || 0,
            lugar.Gastronómico || 0,
            lugar.Entretenimiento || 0
        ];
        
        return features;
    }

    euclideanDistance(point1, point2) {
        return Math.sqrt(
            point1.reduce((sum, value, i) => 
                sum + Math.pow(value - point2[i], 2), 0)
        );
    }

    findCluster(features) {
        let minDistance = Infinity;
        let closestCluster = 0;

        this.centroids.forEach((centroid, i) => {
            const distance = this.euclideanDistance(features, centroid);
            if (distance < minDistance) {
                minDistance = distance;
                closestCluster = i;
            }
        });

        return closestCluster;
    }

    recomendar(region, pais, ciudad, tipoTurismo, presupuesto) {
        // Filtrar lugares por región y país
        let filtrados = this.data.filter(lugar => {
            return lugar[`region_${region}`] === 1 && 
                   lugar[`pais_${pais}`] === 1 &&
                   lugar[`ciudad_${ciudad}`] === 1 &&
                   lugar[tipoTurismo] === 1 &&
                   lugar.Precio <= presupuesto;
        });

        if (filtrados.length === 0) {
            return [];
        }

        // Asignar clusters a lugares filtrados
        filtrados.forEach(lugar => {
            const features = this.standardizeFeatures(lugar);
            lugar.cluster = this.findCluster(features);
        });

        // Seleccionar máximo 3 lugares de diferentes clusters
        const recomendados = [];
        const clustersUsados = new Set();

        // Ordenar por calificación dentro de cada cluster
        filtrados.sort((a, b) => b.Calificación - a.Calificación);

        for (const lugar of filtrados) {
            if (recomendados.length < 3) {
                recomendados.push({
                    nombre: lugar.Nombre,
                    tipoTurismo: tipoTurismo,
                    calificacion: lugar.Calificación,
                    fotoUrl: lugar.Foto,
                    precio: lugar.Precio
                });
                clustersUsados.add(lugar.cluster);
            }
        }

        return recomendados;
    }
}

export default TravelRecommender;