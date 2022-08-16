<!-- 
Copyright 2022 Hewlett Packard Enterprise Development LP.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
-->

<template>
  <div style="background: whitesmoke; width: 100%">
    <div style="margin-top: 50px; margin-bottom: 25px; margin-left: 50px;">
      <h1 class="has-text-weight-bold subtitle">All BLE Devices</h1>
    </div>
    <div style="margin-left: 50px;">
      <table class="table is-bordered is-striped is-hoverable is-fullwidth" style="display: block; height: 600px; overflow: auto;">
        <thead>
          <tr>
            <th>Device ID</th>
            <th>Access Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bledev in bledevs" :key="bledev.device_identifier">
            <th>{{ bledev.device_identifier }}</th>
            <th>{{ formatedAccessPoints(bledev.access_points) }}</th>
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
      bledevs: []
    };
  },
  methods: {
    formatedAccessPoints(aps) {
      let formatted = '';
      for (let i = 0; i < aps.length; i++) {
        formatted += aps[0];

        if (i !== (aps.length - 1)) {
          formatted += ', ';
        }
      }
      return formatted;
    },
    handleEvent(dev) {
      console.log(dev);
      //this.$root.$emit('bleProfile', dev);
    },
    getBleData() {
      axios.get("http://127.0.0.1:3000/tabledata/bledevtable", {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        this.bledevs = res.data.data;
      });
    }
  },
  // functions and variables loaded on page load
  beforeMount() {
    this.getBleData();
  }
};
</script>