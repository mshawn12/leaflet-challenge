// Create smoothdark
let smoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});

// Create grayscale map
var grayScale = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});

// Create global map
let globalMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:'Map via openstreetmap.org &copy;'
    }
);

let baseMap = {
    Global: globalMap,
    Dark: smoothDark,
    Grayscale: grayScale
}

let map = L.map("map", {
    center: [40.7, -94.5],
    zoom: 3,
    layers: [globalMap, smoothDark, grayScale]

})

//baseMap.addTo(map);


// Tectonic Plates & Earthquakes layer groups
let tectonicPlates = new L.LayerGroup();
let earthquakes = new L.LayerGroup();

let BaseMaps = {
    'Global Map': baseMap
}

let overlays = {
    "Tectonic Plates": tectonicPlates,
    "Earthquakes": earthquakes
}

L.control.layers(baseMap, overlays).addTo(map);


// Add colors
function getColor(depth) {
    if(depth > 90) {
        return "#ea2c2c"
    }
    else if (depth > 70) {
        return "ea822c"
    }
    else if (depth > 50) {
        return "#ee9c00"
    }
    else if (depth > 30) {
        return "#eecc00"
    }
    else if (depth > 10) {
        return "#d4ee00"
    }
    else {
        return "#98ee00"
    }
}

// Create radius function based on magnitude
function getRadius(magnitude) {
    if(magnitude === 0) {
        return 1
    }
    return magnitude * 4
}

// Get earthquake data

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data){
    console.log(data);
    function styleInfo(feature){
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.6
        }
    }

    // Get data & add to map
    L.geoJson(data, {
        pointToLayer: function(feature,latlng){
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature,layer){
            layer.bindPopup(`
                Magnitude: ${feature.properties.mag} <br>
                Depth: ${feature.geometry.coordinates[2]} <br>
                Location: ${feature.properties.place}
            `);
        }
    }).addTo(earthquakes);

    earthquakes.addTo(map);



    // Creating, styling, and adding Legend
    let legend = L.control({
        position:"bottomright"
    });

    legend.onAdd = function(){
        let container = L.DomUtil.create("div", "info legend");
        let grades = [-10, 10, 30, 50, 70, 90];
        let colors = ['#98ee00', '#d4ee00', '#eecc00', '#ee9c00', '#ea822c', '#ea2c2c'];
        for(let index = 0; index < grades.length; index++) {
            container.innerHTML += `<i style="background: ${colors[index]}"></i>${grades[index]}+ <br>`
        }
        return container;
    }
        legend.addTo(map);

        d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData){
        L.geoJson(plateData, {
            color: "orange",
            width: 3,
        }).addTo(tectonicPlates);

        tectonicPlates.addTo(map);
        });

});