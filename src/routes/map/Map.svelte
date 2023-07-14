<script>
    import {MarkerClusterer} from "@googlemaps/markerclusterer";
    import {Loader} from "@googlemaps/js-api-loader";
    import {onMount} from "svelte";

    export let data;

    export let map;
    let markers = [];
    let marker;
    let markerPositions = [];
    let markerCluster;
    let infoWindow;
    let topPlayers = ["Mkleo", "あcola", "Sparg0", "Light", "Tea", "Onin", "Shuton", "Tweek", "Riddles", "ProtoBanham", "Kurama",
        "Dabuz", "Kola", "Maister", "Glutonny", "Sonix", "ミーヤー ", "Zomba", "Big D", "ApolloKage", "Bloom4Eva", "Kameme",
        "Anathema", "Cosmos", "Jakal", "Yoshidora", "Sisqui", "Asimo", "KEN", "Aaron", "Tilde", "Lui$", "Almighty", "HIKARU", "へろー",
        "Marss", "Ned", "zackray", "MuteAce", "Yaura", "Gackt", "Talking Ben", "Ouch!?", "Sigma", "Skyjay", "Fatality", "Mr.R",
        "Lima", "Abadango", "Chag", "jaredisking1", "Raflow", "MVD", "Scend", "Puppeh", "Niko", "AlanDiss", "BassMage", "ShinyMark",
        "T3 DOM", "Jazzh0", "Repo", "SHADIC", "Kome", "Luugi", "WaKa", "Toast", "alice", "Tarik", "quiK", "ChunkyKong", "Zinoto",
        "Shirayuki", "アカキクス", "Peabnut", "IceMist", "Leon", "Dark Wizzy", "Supahsemmie", "Quandale Dinglelingleton", "Space",
        "MKBigBoss", "Goblin", "Umeki", "Yei", "Rox", "WaDi", "skittles", "NaetorU", "MASA", "ATATA", "Nietono", "Chronos", "yonni",
        "Atelier", "Ling", "Regalo", "Mr. E", "Paseriman", "enhancedpv"]

    export let mapResult;

    // the loader
    const loader = new Loader({
        apiKey: data.GOOGLE_MAPS_API_KEY,
        version: "weekly",
    });

    // loading in the map
    onMount(async () => {
        loader.load().then(async () => {
            const {Map} = await google.maps.importLibrary("maps");
            let center = {lat: 43.73758865859436, lng: -79.50304080536894};
            infoWindow = new google.maps.InfoWindow();
            map = new google.maps.Map(document.getElementById("map"), {
                center: center,
                zoom: 8,
                styles: [
                    {
                        "featureType": "all",
                        "elementType": "labels.text.fill",
                        "stylers": [{
                            "saturation": 36
                        }, {
                            "color": "#000000"
                        }, {
                            "lightness": 40
                        }]
                    }, {
                        "featureType": "all",
                        "elementType": "labels.text.stroke",
                        "stylers": [{
                            "visibility": "on"
                        }, {
                            "color": "#000000"
                        }, {
                            "lightness": 16
                        }]
                    }, {
                        "featureType": "all",
                        "elementType": "labels.icon",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "administrative",
                        "elementType": "geometry.fill",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 20
                        }]
                    }, {
                        "featureType": "administrative",
                        "elementType": "geometry.stroke",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 17
                        }, {
                            "weight": 1.2
                        }]
                    }, {
                        "featureType": "administrative",
                        "elementType": "labels",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "administrative.country",
                        "elementType": "all",
                        "stylers": [{
                            "visibility": "simplified"
                        }]
                    }, {
                        "featureType": "administrative.country",
                        "elementType": "geometry",
                        "stylers": [{
                            "visibility": "simplified"
                        }]
                    }, {
                        "featureType": "administrative.country",
                        "elementType": "labels.text",
                        "stylers": [{
                            "visibility": "simplified"
                        }]
                    }, {
                        "featureType": "administrative.province",
                        "elementType": "all",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "administrative.locality",
                        "elementType": "all",
                        "stylers": [{
                            "visibility": "simplified"
                        }, {
                            "saturation": "-100"
                        }, {
                            "lightness": "30"
                        }]
                    }, {
                        "featureType": "administrative.neighborhood",
                        "elementType": "all",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "administrative.land_parcel",
                        "elementType": "all",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "landscape",
                        "elementType": "all",
                        "stylers": [{
                            "visibility": "simplified"
                        }, {
                            "gamma": "0.00"
                        }, {
                            "lightness": "74"
                        }]
                    }, {
                        "featureType": "landscape",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 20
                        }]
                    }, {
                        "featureType": "landscape.man_made",
                        "elementType": "all",
                        "stylers": [{
                            "lightness": "3"
                        }]
                    }, {
                        "featureType": "poi",
                        "elementType": "all",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "poi",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 21
                        }]
                    }, {
                        "featureType": "road",
                        "elementType": "geometry",
                        "stylers": [{
                            "visibility": "simplified"
                        }]
                    }, {
                        "featureType": "road.highway",
                        "elementType": "geometry.fill",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 17
                        }]
                    }, {
                        "featureType": "road.highway",
                        "elementType": "geometry.stroke",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 29
                        }, {
                            "weight": 0.2
                        }]
                    }, {
                        "featureType": "road.arterial",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 18
                        }]
                    }, {
                        "featureType": "road.local",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 16
                        }]
                    }, {
                        "featureType": "transit",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 19
                        }]
                    }, {
                        "featureType": "water",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 17
                        }]
                    }],
            });

            map.setOptions({minZoom: 3, maxZoom: 18, zoomControl: true, gestureHandling: "greedy"});
            markerCluster = new MarkerClusterer({map, markers, algorithmOptions: {maxZoom: 7}});
        });
    });


    function hideMarkers() {
        for (let i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers.length = 0;
    }


    function addMarkers(mapResult) {
        hideMarkers();
        markerCluster.clearMarkers()
        markers = [];
        markerPositions = [];

        for (const tournament of mapResult) {
            if (tournament.lat === null || tournament.lng === null) {
                continue;
            }

            marker = new google.maps.Marker({
                position: new google.maps.LatLng(tournament.lat, tournament.lng),
                map: map,
                icon: "markers/red-marker.png"
            });

            if (markerPositions.includes(marker.position.toString())) {
                marker.setIcon("markers/yellow-marker.png")
                marker.setPosition(new google.maps.LatLng(mapResult.lat + 0.0001, mapResult.lng + 0.0001));
            }

            if (tournament.numAttendees > 50) {
                marker.setIcon('markers/green-marker.png')
            }

            if (tournament.numAttendees > 100) {
                marker.setIcon('markers/blue-marker.png')
            }

            if (tournament.numAttendees > 500) {
                marker.setIcon('markers/purple-marker.png')
            }

            if (tournament.state === 3) {
                marker.setIcon('markers/grey-marker.png')
            }

            if (tournament.participants.includes(topPlayers)) {
                console.log("top player")
            }


                // Add the marker to the array
                markers.push(marker);
            markerPositions.push(marker.getPosition().toString());

            const mailTo = (tournament.primaryContact.includes("@")) ?
                "<a href=\"mailto:" + tournament.primaryContact + "\" target=\"_blank\">" + tournament.primaryContact + "</a>" :
                "<a href=\"" + tournament.primaryContact + "\" target=\"_blank\">" + tournament.primaryContact + "</a>";

            // Create an info window for the marker
            google.maps.event.addListener(marker, 'click', (function (marker, tournament) {
                return function () {
                    const infoContent =
                        '<div style="display: block;\n' +
                        '        text-align: left">' +
                        "<h2>" + tournament.name + "</h2>" +
                        "<p><strong>Address: </strong><a target='_blank' href='https://www.google.com/maps/place/" + tournament.venueAddress.replace(" ", "+") + "'>" + tournament.venueAddress + "</a></p>" +
                        "<p><strong>Date: </strong>" + tournament.startAt + "</p>" +
                        "<p><strong>Attendees: </strong>" + tournament.numAttendees + "</p>" +
                        "<p><strong>Contact Info: </strong>" + mailTo + "</p>" +
                        "<p><strong>Start.gg site: </strong><a target='_blank' href='" + tournament.url + "'>" + tournament.url + "</a></p>" +
                        "</div>";

                    infoWindow.setContent(infoContent);
                    infoWindow.open(map, marker);


                    // closing infowindow on clic for anywhere
                    google.maps.event.addListener(map, "click", function (event) {
                        infoWindow.close();
                    });
                    google.maps.event.addListener(map, "drag", function (event) {
                        infoWindow.close();
                    });
                    google.maps.event.addListener(markerCluster, 'click', function (cluster) {
                        infoWindow.close();
                    });
                };

            })(marker, tournament));
        }
        markerCluster.addMarkers(markers)
    }

    $: {
        if (mapResult) {
            addMarkers(mapResult);
        }
    }
</script>

<div id="map" class="map" style="height: 100%; width: 100%">
</div>


<style>
    div {
        border: #222223 solid 4px;
    }

</style>