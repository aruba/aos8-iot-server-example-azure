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
  <div style="background: whitesmoke; width: 100%;" v-if="show">
     <loading-overlay :active="isLoading" :is-full-page="fullPage" :loader="loader" />
      <div style="display: flex;">
          <div style="margin-left:10px; margin-right: 80px; margin-top: 75px">
            <h1 class="has-text-weight-bold subtitle">Radio {{selectedRadio}}</h1>
            <p>Radio Type: {{type}}</p>
            <p>Radio Firmware: {{firmware}}</p>
            <p>Current Health Status: {{health}}</p>
            <p>External: {{external}}</p>
          </div>
      </div>
  </div>

</template>

<script>
import axios from "axios";

export default {
  name: 'Radio',
  data() {
    return {
      selectedRadio: '',
      type: '',
      firmware: '',
      health: '',
      external: '',
      isLoading: false,
      fullPage: false,
      loader: 'dots',
      show: false,
    };
  },
  methods: {
    showRadio(dev) {
      this.isLoading = true;
      this.selectedRadio = dev;

      axios.get("http://127.0.0.1:3000/radioprofile?dev=" + this.selectedRadio, {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        console.log("ap data:", res.data.data[0]);
        let tmpdata = res.data.data[0];

        this.type = tmpdata.type;
        this.firmware = tmpdata.firmware;
        this.health = tmpdata.last_health_status;
        this.external = tmpdata.external;
        this.isLoading = false;
      });

    }
  },
  /*mounted: function() {
      let connection = new WebSocket('ws://127.0.0.1:3000/');
      connection.onmessage = (event) => {
        try {
          //console.log(event);
          if (event.data.hasOwnProperty('apId')) {
            console.log("has id apId");
            console.log(event.data);
          }
        } catch (err) {
          console.error(err);
        }
      }

      this.$root.$on('apProfile', (item) => {
        // your code goes here
        console.log("item and response in ap profile:", item);
        this.showAp(item);
      });
  },*/
  mounted() {
    this.$root.$on('radioProfile', (item) => {
      // your code goes here
      console.log("item and response in radio profile:", item);
      this.showRadio(item);
      this.show = true;
    });
  },
};
</script>