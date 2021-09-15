<template>
  <div style="background: whitesmoke; width: 100%">
    <div style="margin-top: 50px; margin-bottom: 25px; margin-left: 50px;">
      <h1 class="has-text-weight-bold subtitle">All Radio Devices</h1>
    </div>
    <div style="margin-left: 50px;">
      <table class="table is-bordered is-striped is-hoverable is-fullwidth" style="display: block; height: 500px; overflow: auto;">
        <thead>
          <tr>
            <th>Mac Address</th>
            <th>Type</th>
            <th>Firmware</th>
            <th>Last Health Status</th>
            <th>External</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="radio in radios" :key="radio.mac_addr">
            <th>{{ radio.mac_addr }}</th>
            <th>{{ radio.type }}</th>
            <th>{{ radio.firmware }}</th>
            <th>{{ radio.last_health_status  }}</th>
            <th>{{ radio.external }}</th>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'RadioTopology',
  data() {
    return {
      radios: []
    };
  },
  methods: {
    handleEvent(dev) {
      console.log(dev);
      //this.$root.$emit('bleProfile', dev);
    },
    getRadioData() {
      axios.get("http://127.0.0.1:3000/tabledata/radiotable", {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        this.radios = res.data.data;
      });
    }
  },
  // functions and variables loaded on page load
  beforeMount() {
    this.getRadioData();
  }
};
</script>