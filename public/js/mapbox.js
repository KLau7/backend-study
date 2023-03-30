/* eslint-disable */
console.log('[client] Test');

const locations = document.getElementById('map');
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1Ijoia2xhdTciLCJhIjoiY2xmaGhmMXpsMDRqdzNzc3k4c3FlMm14aCJ9.uEubfxwxXePfozfTx0XLlw';

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: [-74.5, 40], // starting position [lng, lat]
  zoom: 9, // starting zoom
});
