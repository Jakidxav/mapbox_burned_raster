// add access token
mapboxgl.accessToken = 'pk.eyJ1IjoiamRyaXNjb2wiLCJhIjoiY2xvZWNub3ZnMDFjNzJrdWg3N2Rib3RucyJ9.sGEAdc6qcHv2VxG09ScItw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    zoom: 1.5,
    center: [260, 40],
    // projection: 'globe',
    // projection: 'equirectangular',
    // projection: 'mercator',
});

map.on("style.load", () => {
    const styleJson = map.getStyle();
    const layers = styleJson.layers
    // https://stackoverflow.com/questions/43841144/remove-all-labels-on-mapbox-gl-js
    for (let idx in layers) {
        if (layers[idx].type == "symbol" && layers[idx].id != "country-label") {
            // if(layers[idx].type == "symbol") {
            //console.log(layers[idx].id, layers[idx].type);
            map.setLayoutProperty(layers[idx].id, 'visibility', 'none');
        }
    }
    //set the default atmosphere style
    map.setFog({
        "range": [-21, 0],
        // "range": [0, 1],
        "horizon-blend": 0.00,
        "star-intensity": 0.1,
    });
});

const zoomThreshold = 5;

map.on('load', () => {
    // const variableSelector = document.getElementById("variable-selector");
    // let layer = variableSelector.value.toLowerCase();
    // const displayText = document.getElementById("display-text");
    // const oceanMaskToggle = document.getElementById("toggle-ocean");
    // const lakeMaskToggle = document.getElementById("toggle-lakes");
    // const countryToggle = document.getElementById("toggle-countries");
    // const stateToggle = document.getElementById("toggle-states");
    // const gadmToggle = document.getElementById("toggle-gadm");

    const variableSelector = document.getElementById("variable_selector");
    let layer = variableSelector.value.toLowerCase();
    const displayText = document.getElementById("display_text");
    const oceanMaskToggle = document.getElementById("toggle_ocean");
    const lakeMaskToggle = document.getElementById("toggle_lakes");
    // const countryToggle = document.getElementById("toggle_countries");
    // const stateToggle = document.getElementById("toggle_states");

    map.addSource('raster-source', {
        'type': 'geojson',
        'data': raster_grid
    });

    const rasterGridFill = map.addLayer({
        'id': 'raster-fill',
        'type': 'fill',
        'source': "raster-source",
        paint: {
            'fill-color': ['get', 'tavg_color'
            ],
        }
    });

    const oceanSource = map.addSource('ocean-source', {
        type: 'geojson',
        data: ocean,
    })

    const oceanMask = map.addLayer({
        'id': 'ocean-mask',
        'type': 'fill',
        'source': 'ocean-source', // this should match the source above
        'paint': {
            // 'fill-color': "#1b1e23", // carbonplan
            'fill-color': '#1F1F1F' // mapbox
            // "fill-outline-color": '#1b1e23',
        },
    });

    const lakeSource = map.addSource('lake-source', {
        type: 'geojson',
        data: lakes,
    });

    const lakeMask = map.addLayer({
        'id': 'lake-mask',
        'type': 'fill',
        'source': 'lake-source', // this should match the source above
        'paint': {
            'fill-color': '#1F1F1F' // mapbox
        },
        'layout': {
            'visibility': 'none',
        },
    });

    const lakeOutline = map.addLayer({
        'id': 'lake-outline',
        'type': 'line',
        'source': 'lake-source', // this should match the source above
        // 'source-layer': 'lakes', // this is the name of the layer in the pbf file
        'paint': {
            // 'line-color': '#888', // mapbox
            'line-color': '#ebebec', // carbonplan

            // 'line-width': 0.25        
        },
        'layout': {
            'visibility': 'none',
        },
    });

    // const landSource = map.addSource('land-source', {
    //     type: 'geojson',
    //     data: land,
    // })

    // const landOutline = map.addLayer({
    //     'id': 'land-outline',
    //     'type': 'line',
    //     'source': 'land-source', // this should match the source above
    //     'source-layer': 'land', // this is the name of the layer in the pbf file
    //     'paint': {
    //         'line-color': '#ebebec', // carbonplan
    //     },
    // });

    // const countrySource = map.addSource('country-source', {
    //     type: 'geojson',
    //     data: countries,
    // })

    // const countryOutline = map.addLayer({
    //     'id': 'country-outline',
    //     'type': 'line',
    //     'source': 'country-source', // this should match the source above
    //     // 'source-layer': 'states', // this is the name of the layer in the pbf file
    //     // "minzoom": zoomThreshold, // minzoom for higher resolution
    //     'paint': {
    //         // 'line-color': '#888',
    //         'line-color': '#ebebec', // carbonplan
    //         'line-width': 0.25
    //     },
    //     'layout': {
    //         'visibility': 'none',
    //     },
    // });

    // const stateSource = map.addSource('state-source', {
    //     type: 'geojson',
    //     data: states,
    // })

    // const stateOutline = map.addLayer({
    //     'id': 'state-outline',
    //     'type': 'line',
    //     'source': 'state-source', // this should match the source above
    //     // 'source-layer': 'states', // this is the name of the layer in the pbf file
    //     // "minzoom": zoomThreshold, // minzoom for higher resolution
    //     'paint': {
    //         // 'line-color': '#888',
    //         'line-color': '#ebebec', // carbonplan
    //         'line-width': 0.25
    //     },
    //     'layout': {
    //         'visibility': 'none',
    //     },
    // });



    variableSelector.addEventListener("change", () => {
        layer = variableSelector.value.toLowerCase();
        map.setPaintProperty('raster-fill', 'fill-color', ['get', layer + '_color']);
        // if (layer == "drought") {
        //     map.setPaintProperty('polygon-fill', 'fill-color', ['interpolate-lab', ['linear'], ['get', 'mean_'+layer], 0, "#fff5f0", 0.78, "#cb181d"]);
        // } else { // right now, else defaults to vpd
        //     map.setPaintProperty('polygon-fill', 'fill-color', ['get', 'color_'+layer]);
        // }
    })

    oceanMaskToggle.addEventListener("change", () => {
        const visibility = map.getLayoutProperty('ocean-mask', 'visibility');
        if (visibility == 'none') {
            map.setLayoutProperty('ocean-mask', 'visibility', 'visible');
        } else {
            map.setLayoutProperty('ocean-mask', 'visibility', 'none');
        }
    })

    lakeMaskToggle.addEventListener("change", () => {
        const visibility = map.getLayoutProperty('lake-mask', 'visibility');
        if (visibility == 'none') {
            map.setLayoutProperty('lake-mask', 'visibility', 'visible');
            map.setLayoutProperty('lake-outline', 'visibility', 'visible');

        } else {
            map.setLayoutProperty('lake-mask', 'visibility', 'none');
            map.setLayoutProperty('lake-outline', 'visibility', 'none');
        }
    })

    // countryToggle.addEventListener("change", () => {
    //     const visibility = map.getLayoutProperty('country-outline', 'visibility');
    //     if (visibility == 'none') {
    //         map.setLayoutProperty('country-outline', 'visibility', 'visible');

    //     } else {
    //         map.setLayoutProperty('country-outline', 'visibility', 'none');
    //     }
    // })

    // stateToggle.addEventListener("change", () => {
    //     const visibility = map.getLayoutProperty('state-outline', 'visibility');
    //     if (visibility == 'none') {
    //         map.setLayoutProperty('state-outline', 'visibility', 'visible');

    //     } else {
    //         map.setLayoutProperty('state-outline', 'visibility', 'none');
    //     }
    // })

    map.on('mousemove', 'raster-fill', (event) => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        let tempLayerName = variableSelector.value;
        let printLayer;
        if (tempLayerName != 'vpd') {
            printLayer = tempLayerName.charAt(0).toUpperCase() + tempLayerName.slice(1);
        } else {
            printLayer = tempLayerName.toUpperCase();
        }

        // Use the first found feature.
        const feature = event.features[0];
        // console.log(feature.properties);

        const locationLngLat = event.lngLat.wrap();
        const lat = locationLngLat.lat.toFixed(2);
        const lon = locationLngLat.lng.toFixed(2);
        const cellValue = Number.parseFloat(feature.properties[layer + "_value"]).toFixed(2);
        // const cellValue = Number.parseFloat(feature.properties["drought_value"]).toFixed(2);

        displayText.innerHTML = '';
        // displayText.style.display = 'block';
        // displayText.innerHTML = `Grid cell number: ${feature.properties.id}<br><br>`;
        displayText.innerHTML += `Lat/lon coordinates: ${lon}, ${lat}<br><br>`;
        displayText.innerHTML += `${printLayer} value: ${cellValue}`

    });

    map.on('mouseleave', 'raster-fill', () => {
        map.getCanvas().style.cursor = '';
        displayText.innerHTML = 'Hover over a location to print location and data variable value information.';
    });
});