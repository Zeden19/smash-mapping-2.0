<script>
  import * as GMaps from "@googlemaps/js-api-loader";
  import * as MC from "@googlemaps/markerclusterer"
  import {circles} from "../stores.js"

  import {onMount} from "svelte";

  const {Loader} = GMaps;
  const {MarkerClusterer} = MC;

  export let data;
  export let map;
  let markers = [];
  let marker;
  let markerPositions = [];
  let markerCluster;
  let infoWindow;
  let superMajors = [{label: "Evo 2023", marker: "evo-marker.png"},
    {label: "Riptide 2023", marker: "riptide-marker.png"},
    {label: "Super Smash Con 2023", marker: "ssc-marker.png"},
    {label: "Delfino Maza 2023", marker: "delfino-maza-marker.png"},
    {label: "Tera", marker: "tera-marker.png"},
    {label: "Rise 'N Grind 2023", marker: "rng-marker.png"}]

  // the loader
  const loader = new Loader({
    apiKey: data.GOOGLE_MAPS_API_KEY,
    version: "weekly",
  });

  // loading in the map
  onMount(async () => {
    loader.load().then(async () => {
      const {Map} = await google.maps.importLibrary("maps");
      let center = {lat: 39.8283, lng: -98.5795};
      infoWindow = new google.maps.InfoWindow();
      map = new google.maps.Map(document.getElementById("map"), {
        center: center,
        zoom: 4,
        styles: [
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "saturation": 36
              },
              {
                "color": "#000000"
              },
              {
                "lightness": 40
              }
            ]
          },
          {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "visibility": "on"
              },
              {
                "color": "#000000"
              },
              {
                "lightness": 16
              }
            ]
          },
          {
            "featureType": "all",
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 20
              }
            ]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 17
              },
              {
                "weight": 1.2
              }
            ]
          },
          {
            "featureType": "administrative",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.country",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "administrative.country",
            "elementType": "geometry",
            "stylers": [
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "administrative.country",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "visibility": "on"
              },
              {
                "saturation": "-18"
              },
              {
                "lightness": "-71"
              },
              {
                "weight": "1.30"
              }
            ]
          },
          {
            "featureType": "administrative.country",
            "elementType": "labels.text",
            "stylers": [
              {
                "visibility": "simplified"
              }
            ]
          },
          {
            "featureType": "administrative.country",
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.province",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.province",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "visibility": "on"
              },
              {
                "weight": "1.20"
              },
              {
                "saturation": "-36"
              },
              {
                "lightness": "99"
              },
              {
                "gamma": "4.45"
              },
              {
                "color": "#000000"
              }
            ]
          },
          {
            "featureType": "administrative.province",
            "elementType": "labels.text",
            "stylers": [
              {
                "visibility": "on"
              }
            ]
          },
          {
            "featureType": "administrative.locality",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "simplified"
              },
              {
                "saturation": "-100"
              },
              {
                "lightness": "30"
              }
            ]
          },
          {
            "featureType": "administrative.neighborhood",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.neighborhood",
            "elementType": "labels.text",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.land_parcel",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "simplified"
              },
              {
                "gamma": "0.00"
              },
              {
                "lightness": "74"
              }
            ]
          },
          {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 20
              }
            ]
          },
          {
            "featureType": "landscape.man_made",
            "elementType": "all",
            "stylers": [
              {
                "lightness": "3"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 21
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "all",
            "stylers": [
              {
                "visibility": "on"
              },
              {
                "hue": "#ff0000"
              },
              {
                "saturation": "-100"
              },
              {
                "lightness": "33"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
              {
                "saturation": "-100"
              },
              {
                "weight": "0.10"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "weight": "0.10"
              },
              {
                "saturation": "0"
              },
              {
                "lightness": "0"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 19
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#000000"
              },
              {
                "lightness": 17
              }
            ]
          }
        ],
      });

      const renderer = {
        render: ({count, position}, stats) => {
          const color = count > Math.max(10, stats.clusters.markers.mean)
            ? "#ff0000"
            : "#FFC72C";


          // create svg url with fill color
          const svg = window.btoa(`
                        <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
                          <circle cx="120" cy="120" opacity=".6" r="70" />
                          <circle cx="120" cy="120" opacity=".3" r="90" />
                          <circle cx="120" cy="120" opacity=".2" r="110" />
                        </svg>`);

          // create marker using svg icon
          return new google.maps.Marker({
            position,
            icon: {
              url: `data:image/svg+xml;base64,${svg}`,
              scaledSize: new google.maps.Size(45, 45),
            },
            label: {
              text: String(count),
              color: "rgba(255,255,255,0.9)",
              fontSize: "12px",
            },
            // adjust zIndex to be above other markers
            zIndex: 1000 + count,
          });
        }
      };
      map.setOptions({minZoom: 3, maxZoom: 18, zoomControl: true, gestureHandling: "greedy"});
      markerCluster = new MarkerClusterer({map, markers, renderer: renderer, algorithmOptions: {maxZoom: 6}});
    });
  });

  function hideMarkers() {
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers.length = 0;
  }

  export const addMarkers = (mapResult) => {
    hideMarkers();
    markerCluster?.clearMarkers()
    markers = [];
    markerPositions = [];

    for (const tournament of mapResult) {
      if (tournament.lat === null || tournament.lng === null) {
        continue;
      }

      marker = new google.maps.Marker({
        position: new google.maps.LatLng(tournament.lat, tournament.lng),
        map: map,
        icon: "markers/red-marker.png",
        animation: google.maps.Animation.DROP
      });

      if (markerPositions.includes(marker.position.toString())) {
        marker.setPosition(new google.maps.LatLng(tournament.lat + 0.001, tournament.lng + 0.001));
      }

      if (tournament.state === 3) {
        marker.setIcon('markers/grey-marker.png');
      } else if (superMajors.some(major => major.label === tournament.name)) {
        const majorMarker = superMajors.find(major => major.label === tournament.name).marker;
        marker.setIcon(`markers/${majorMarker}`);
      } else if (tournament.numAttendees > 500) {
        marker.setIcon('markers/purple-marker.png');
      } else if (tournament.numAttendees > 300) {
        marker.setIcon('markers/orange-marker.png');
      } else if (tournament.numAttendees > 150) {
        marker.setIcon('markers/blue-marker.png');
      } else if (tournament.numAttendees > 50) {
        marker.setIcon('markers/green-marker.png');
      }

      // Add the marker to the array
      markers.push(marker);
      markerPositions.push(marker.getPosition().toString());

      // Create an info window for the marker
      google.maps.event.addListener(marker, 'click', (function (marker, tournament) {
        return function () {

          const infoContent = `
                    <div>
                    <div style="background-image:url('${tournament.banner}')" class="info-window-header">
                      <img class="info-window-thumbnail" alt="tournament thumbnail" src="${tournament.thumbnail}"/>
                      <a href="${tournament.url}" target="_blank" class="info-window-title">${tournament.name}</a>
                    </div>

                      <div class="info-window-content">
                        <span class="info-window-data">
                          <img class="info-window-icons" alt="address icon" src="/tournament-card-icons/map-marker.png"/>
                          <a class="info-window-address" target="_blank" href="https://www.google.com/maps/place/${tournament.venueAddress.replace(" ", "+")}">${tournament.venueAddress}</a>
                        </span>

                        <span class="info-window-data">
                          <img class="info-window-icons" alt="date icon" src="/tournament-card-icons/clock.png"/>
                          <div>${tournament.startAt}</div>
                        </span>

                        <span class="info-window-data">
                          <img class="info-window-icons" alt="attendees icon" src="/tournament-card-icons/people.png"/>
                          <div>${tournament.numAttendees}</div>
                        </span>

                        <span class="info-window-data">
                          <img class="info-window-icons" alt="contact icon" src="/tournament-card-icons/contact.png"/>
                          <a class="info-window-contact" target="_blank" href="${(tournament.primaryContact.includes("@")) ? `mailto:${tournament.primaryContact}` : `${tournament.primaryContact}`}">${tournament.primaryContact}</a>
                        </span>
                      </div>
                    </div>`
          infoWindow.setContent(infoContent);
          infoWindow.open(map, marker);


          // closing infowindow on click for anywhere
          google.maps.event.addListener(map, "click", function () {
            infoWindow.close();
          });
          google.maps.event.addListener(map, "drag", function () {
            infoWindow.close();
          });
          google.maps.event.addListener(markerCluster, 'click', function () {
            infoWindow.close();
          });
          if ($circles[1]) google.maps.event.addListener($circles[1], 'click', function () {
            infoWindow.close();
          });
        };

      })(marker, tournament));
    }

    markerCluster?.addMarkers(markers)
    return ""
  }
</script>


<div id="map" class="map" style="height: 100%; width: 100%">
</div>


<style>
  div {
    border: #222223 solid 4px;
  }

</style>