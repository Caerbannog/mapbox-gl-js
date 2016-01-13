
mapboxgl.accessToken = getAccessToken();

var map = new mapboxgl.Map({
    container: 'map',
    zoom: 12.5,
    center: [-77.01866, 38.888],
    style: 'mapbox://styles/mapbox/streets-v8',
    hash: true
});

map.addControl(new mapboxgl.Navigation());

map.on('style.load', function() {
    map.addSource('geojson', {
        "type": "geojson",
        "data": "/debug/trees-na.json",
        "maxzoom": 19,
        cluster: true
    });

    map.addLayer({
        "id": "tree_single",
        "type": "circle",
        "source": "geojson",
        "filter": ['!=', 'cluster', true],
        "paint": {
            "circle-color": "rgba(0, 200, 0, 0.8)",
            "circle-radius": "10"
        }
    }, 'country-label-lg');

    map.addLayer({
        "id": "tree_cluster_big",
        "type": "circle",
        "source": "geojson",
        "filter": ['all', ['==', 'cluster', true], ['>=', 'numPoints', 10000]],
        "paint": {
            "circle-color": "rgba(255, 100, 100, 0.8)",
            "circle-radius": "20"
        }
    }, 'country-label-lg');

    map.addLayer({
        "id": "tree_cluster_average",
        "type": "circle",
        "source": "geojson",
        "filter": ['all', ['==', 'cluster', true], ['>=', 'numPoints', 1000], ['<', 'numPoints', 10000]],
        "paint": {
            "circle-color": "rgba(240, 200, 0, 0.8)",
            "circle-radius": "20"
        }
    }, 'country-label-lg');

    map.addLayer({
        "id": "tree_cluster_small",
        "type": "circle",
        "source": "geojson",
        "filter": ['all', ['==', 'cluster', true], ['<', 'numPoints', 1000]],
        "paint": {
            "circle-color": "rgba(0, 200, 0, 0.8)",
            "circle-radius": "20"
        }
    }, 'country-label-lg');

    map.addLayer({
        "id": "tree_label",
        "type": "symbol",
        "source": "geojson",
        "filter": ['==', 'cluster', true],
        "layout": {
            "text-field": "{numPointsH}",
            "text-font": [
                "Open Sans Semibold",
                "Arial Unicode MS Bold"
            ],
            "text-size": 12
        },
        "paint": {
            "text-color": "black"
        }
    }, 'country-label-lg');

    var bufferTimes = {};
    map.on('tile.stats', function(bufferTimes) {
        var _stats = [];
        for (var name in bufferTimes) {
            var value = Math.round(bufferTimes[name]);
            if (isNaN(value)) continue;
            var width = value;
            _stats.push({name: name, value: value, width: width});
        }
        _stats = _stats.sort(function(a, b) { return b.value - a.value }).slice(0, 10);

        var html = '';
        for (var i in _stats) {
            html += '<div style="width:' + _stats[i].width * 2 + 'px">' + _stats[i].value + 'ms - ' + _stats[i].name + '</div>';
        }

        document.getElementById('buffer').innerHTML = html;
    });
});

map.on('click', function(e) {
    if (e.originalEvent.shiftKey) return;
    (new mapboxgl.Popup())
        .setLngLat(map.unproject(e.point))
        .setHTML("<h1>Hello World!</h1>")
        .addTo(map);
});

document.getElementById('debug-checkbox').onclick = function() {
    map.debug = !!this.checked;
};

document.getElementById('collision-debug-checkbox').onclick = function() {
    map.collisionDebug = !!this.checked;
};

document.getElementById('buffer-checkbox').onclick = function() {
    document.getElementById('buffer').style.display = this.checked ? 'block' : 'none';
};

// keyboard shortcut for comparing rendering with Mapbox GL native
document.onkeypress = function(e) {
    if (e.charCode === 111 && !e.shiftKey && !e.metaKey && !e.altKey) {
        var center = map.getCenter();
        location.href = "mapboxgl://?center=" + center.lat + "," + center.lng + "&zoom=" + map.getZoom() + "&bearing=" + map.getBearing();
        return false;
    }
};

function getAccessToken() {
    var match = location.search.match(/access_token=([^&\/]*)/);
    var accessToken = match && match[1];

    if (accessToken) {
        localStorage.accessToken = accessToken;
    } else {
        accessToken = localStorage.accessToken;
    }

    return accessToken;
}
