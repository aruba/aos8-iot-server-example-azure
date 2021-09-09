<template>
  <div style="background: whitesmoke; width: 100%">
    <div style="margin-top: 50px; margin-bottom: 25px; margin-left: 50px;">
      <h1 class="has-text-weight-bold subtitle">All USB Devices</h1>
    </div>
    <div style="margin-left: 50px;">
      <table class="table is-bordered is-striped is-hoverable is-fullwidth" style="display: block; height: 500px; overflow: auto;">
        <thead>
          <tr>
            <th>Device ID</th>
            <th>Last Health Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usb in usbs" :key="usb.id">
            <th>{{ usb.id }}</th>
            <th>{{ usb.last_health_status }}</th>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'BleTopology',
  data() {
    return {
      usbs: []
    };
  },
  methods: {
    handleEvent(dev) {
      console.log(dev);
      //this.$root.$emit('bleProfile', dev);
    },
    getUsbData() {
      axios.get("http://127.0.0.1:3000/tabledata/usbtable", {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        this.usbs = res.data.data;
      });
    }
  },
  // functions and variables loaded on page load
  beforeMount() {
    this.getUsbData();
  }
};
</script>