mapboxgl.accessToken = 'pk.eyJ1IjoiamRyaXNjb2wiLCJhIjoiY2xvZWNub3ZnMDFjNzJrdWg3N2Rib3RucyJ9.sGEAdc6qcHv2VxG09ScItw';

const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/dark-v11',
    zoom: 1.5,
    center: [260, 40],
    projection: 'globe'
});

map.on("style.load", () => {
    const styleJson = map.getStyle();
    layers = styleJson.layers
    // Set the default atmosphere style
    for(idx in layers) {
        if(layers[idx].type == "symbol" && layers[idx].id != "country-label") {
            //console.log(layers[idx].id, layers[idx].type);
            map.setLayoutProperty(layers[idx].id, 'visibility', 'none');
        }
    }
    map.setFog({
        "range": [-21, 0],
         "horizon-blend": 0.00,
         "star-intensity": 0.1,
    });
});

const zoomThreshold = 4;

map.on('load', () => {
    // map.addSource('drought', {
    //     type: 'geojson',
    //     data: drought,
    // });

    // // change layer by zoom level
    // // https://docs.mapbox.com/mapbox-gl-js/example/updating-choropleth/
    // map.addLayer({
    //     'id': 'drought-layer',
    //     'type': 'fill',
    //     'source': "drought",
    //    // "maxzoom": zoomThreshold,
    //     paint: {
    //         //https://docs.mapbox.com/mapbox-gl-js/example/data-driven-lines/
    //         //https://stackoverflow.com/questions/64805279/how-to-change-styles-properties-of-features-by-data-from-extra-json-file-mapbo
    //         //'fill-color': ['get', 'color'],
    //         'fill-color': ['interpolate-lab', ['linear'], ['get', 'polygon_mean'], 0, "#fff5f0", 0.78, "#cb181d"],
    //     }
    // });

    map.addSource('drought-highres', {
        type: 'geojson',
        data: drought_highres,
    });

    map.addLayer({
        'id': 'drought-vector-layer',
        'type': 'fill',
        'source': "drought-highres",
        //"minzoom": zoomThreshold, // minzoom for higher resolution
        paint: {
            //https://docs.mapbox.com/mapbox-gl-js/example/data-driven-lines/
            //https://stackoverflow.com/questions/64805279/how-to-change-styles-properties-of-features-by-data-from-extra-json-file-mapbo
            'fill-color': ['interpolate-lab', ['linear'], ['get', 'polygon_mean'], 0, "#fff5f0", 0.78, "#cb181d"],
        }
    });

    map.addLayer({
        'id': 'drought-line-layer',
        'type': 'line',
        'source': "drought-highres",
        "minzoom": zoomThreshold, // minzoom for higher resolution
        paint: {
            'line-color': '#888',
            'line-width': 0.25
            }
    });



    map.addControl(new mapboxgl.ScaleControl(), {"position": "top-right"});
});