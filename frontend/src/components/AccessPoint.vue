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
            <h1 class="has-text-weight-bold subtitle">Access Point {{selectedAp}}</h1>
            <p>Current Health Status: {{health}}</p>

            <div style="display: flex;">
              <div style = "margin-right: 30px;">
                <p>{{numRadios}} total Radio(s):</p>
                <ul>
                  <li style="margin-bottom: 10px; margin-left: 20px; list-style-type: circle; display: list-item;" v-for="(radio, i) in apRadioList" :key="i">{{radio.name}} | Most Recent Time Reported: {{radio.time}}</li>
                </ul>
              </div>

              <div>
                <p>{{numUsbs}} total Usb(s):</p>
                <ul>
                  <li style="margin-bottom: 5px; margin-left: 40px; list-style-type: circle; display: list-item;" v-for="(usb, i) in apUsbList" :key="i">{{usb.name}} | Most Recent Time Reported: {{usb.time}}</li>
                </ul>
              </div>

            </div>
          </div>

          <div style="margin-top: 75px">
            <p>{{numDevs}} total BLE Device(s) Reported:</p>
            <ul>
              <li style="margin-bottom: 10px; margin-left: 20px; list-style-type: circle; display: list-item;" v-for="(bledev, i) in apDevList" :key="i">{{bledev.dev}} | Avg RSSI: {{bledev.rssi}}</li>
            </ul>
          </div>
      </div>
  </div>

</template>

<script>
import axios from "axios";

export default {
  name: 'AccessPoint',
  data() {
    return {
      apDevList: [],
      numDevs: 0,
      apRadioList: [],
      numRadios: 0,
      apUsbList: [],
      numUsbs: 0,
      selectedAp: '',
      health: '',
      isLoading: false,
      fullPage: false,
      loader: 'dots',
      show: false
    };
  },
  methods: {
    showAp(dev) {
      this.isLoading = true;
      this.selectedAp = dev;
      this.apDevList = [];
      this.apRadioList = [];
      this.apUsbList = [];

      axios.get("http://127.0.0.1:3000/approfile?dev=" + this.selectedAp, {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        console.log("ap data:", res.data.data[0]);
        let tmpdata = res.data.data[0];

        this.health = tmpdata.last_health_status;
        for (let i = 0; i < tmpdata.ble_devices.length; i++) {
          this.apDevList.push({"name": tmpdata.ble_devices[i]});
        }
        this.numDevs = this.apDevList.length;

        for (let i = 0; i < tmpdata.usb_devices.length; i++) {
          this.apUsbList.push({"name": tmpdata.usb_devices[i]});
        }
        this.numUsbs = this.apUsbList.length;

        for (let i = 0; i < tmpdata.radio_devices.length; i++) {
          this.apRadioList.push({"name": tmpdata.radio_devices[i]});
        }
        this.numRadios = this.apRadioList.length

        axios.post("http://127.0.0.1:3000/avgrssi", {
          method: "POST",
          body: JSON.stringify({
            devs: this.apDevList,
            ap: this.selectedAp
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        }).then((res) => {
          console.log("avg rssi values:", res.data.data);

          this.apDevList = [];
          for (let i = 0; i < res.data.data.length; i++) {
            this.apDevList.push(res.data.data[i]);
          }

          this.isLoading = false;
        });
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
    this.$root.$on('apProfile', (item) => {
      // your code goes here
      //console.log("item and response in ap profile:", item);
      this.showAp(item);
      this.show = true;
    });
  },
};
</script>