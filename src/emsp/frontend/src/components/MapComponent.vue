<template>
  <div ref="map-root" id="map_root">
  </div>
</template>

<script lang="ts">

import 'ol/ol.css'
import { onMounted, defineComponent } from 'vue'
import station_map_controller from "@/controllers/station_map_controller";

export default defineComponent({
  setup() {
    onMounted(async () => {
      await station_map_controller.generateMap(document.getElementById("map_root")!)

      const mapLayer = document.getElementsByClassName("ol-viewport").item(0);
      mapLayer?.classList.add("rounded-lg");
    })
  }
})
</script>

<style>

#map_root {
  width: 100%;
  height: 100%;
}

</style>