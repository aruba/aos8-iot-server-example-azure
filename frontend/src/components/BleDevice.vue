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
          <div style="margin-left:10px; margin-right: 60px; margin-top: 75px">
            <h1 class="has-text-weight-bold subtitle">Device {{ selectedDev }}</h1>
            <p>Reported by {{numAps}} total Access Points:</p>
            <ul>
              <li style="margin-bottom: 10px; margin-left: 40px; list-style-type: circle; display: list-item;" v-for="(bleAp, i) in bleApList" :key="i">{{bleAp}}</li>
            </ul>
          </div>

          <div>
            <div style="float: right; margin-top: 10px; margin-bottom: 25px;">
              <b-button @click="isComponentModalActive = true; SBconnect()">Control this Device</b-button>
            </div>

            <div style="clear: right; margin-bottom: 10px;">
              <h1 class="has-text-weight-bold subtitle">RSSI Over Time Visualization</h1>
            </div>

            <div style="display: flex;">
                <v-select
                    v-model="selectedDay"
                    :items="days"
                    label="Select A Day"
                    @input="handleDayChange"
                    dense
                ></v-select>

                <v-select
                    v-model="selectedAp"
                    :items="apsfordayble"
                    label="Select An Access Point"
                    @input="showChart"
                    dense
                ></v-select>
            </div>

            <div id="dygraph" ref="dychart"></div>

            <div style="align-content: center">Highlight over a section to zoom in, double click to zoom out</div>

            <b-modal :active.sync="isComponentModalActive" has-modal-card full-screen>
                  <div class="modal-card" style="width: 1450px; height: 1300px;">
                      <header class="modal-card-head">
                        <div>
                          <p class="modal-card-title">SouthBound API for {{ selectedDev }}</p>
                          <p v-if="status === 'success'" style="color: green;"> - Status: {{ status }}</p>
                          <p v-else-if="status === 'disconnected'" style="color: red;"> - Status: {{ status }}</p>
                          <p v-else> - Status: {{ status }}</p>
                          <p v-if="statusString === 'Connection Successful!'" style="color: green;"> - Status String: {{ statusString }}</p>
                          <p v-else-if="statusString === 'disconnected'" style="color: red;"> - Status String: {{ statusString }}</p>
                          <p v-else> - Status String: {{ statusString }}</p>
                        </div>

                        <div style="margin-left: 600px; display: flex">
                          <button @click="SBconnect()" class="button is-success">Connect</button>
                          <button @click="SBdisconnect()" class="button is-danger">Disconnect</button>
                        </div>
                      </header>
                      <section class="modal-card-body">
                          <div style="display: flex; margin-top: 20px;">
                            <div style="margin-right: 40px;">
                                <div style="display: flex;">
                                  <v-select
                                      v-model="selectedUuidPair"
                                      :items="uuidpair"
                                      label="Select a characteristicUuid | serviceUuid pair"
                                      @input="handleUuidChange"
                                      dense
                                  ></v-select>

                                  <v-select
                                      v-model="selectedProperty"
                                      :items="curprops"
                                      label="Select a property"
                                      dense
                                  ></v-select>
                                </div>

                                <div v-if="selectedProperty==='writeWithResponse'">
                                  <span>data: </span>
                                  <textarea style="outline: none !important; border-color: black; box-shadow: 0 0 10px black; height: 30px;" v-model="SBdata" placeholder="data"></textarea>
                                </div>

                                <div v-else-if="selectedProperty==='writeWithoutResponse'">
                                  <span>data: </span>
                                  <textarea style="outline: none !important; border-color: black; box-shadow: 0 0 10px black; height: 30px;" v-model="SBdata" placeholder="data"></textarea>
                                </div>

                                <div v-else-if="selectedProperty==='notify'">
                                  <input type="checkbox" id="checkboxNotify" v-model="SBsubbool">
                                  <label for="checkboxNotify">Subscribe to Notifications</label>
                                </div>

                                <div v-else-if="selectedProperty==='indicate'">
                                  <input type="checkbox" id="checkboxIndicate" v-model="SBsubbool">
                                  <label for="checkboxIndicate">Subscribe to Notifications</label>
                                </div>

                                <!-- NOT TESTED -->
                                <div v-else-if="selectedProperty==='characteristicUpdate'">
                                  <span>data</span>
                                  <input v-model="SBcharacteristicval" placeholder="data in base64 written to BLE device">
                                </div>

                                <!-- NOT TESTED -->
                                <div v-else-if="selectedProperty==='authenticate'">
                                  <span>method</span>
                                  <select v-model="SBauthmethod">
                                    <option disabled value="">Please select a Method</option>
                                    <option>none</option>
                                    <option>passkey</option>
                                    <option>oob</option>
                                    <option>lescNone</option>
                                    <option>lescPasskey</option>
                                    <option>lescOob</option>
                                  </select>

                                  <input type="checkbox" id="checkboxAuthBonding" v-model="SBauthbonding">
                                  <label for="checkboxAuthBonding">Bonding</label>

                                  <span>passkey(optional)</span>
                                  <input v-model="SBauthpasskey" placeholder="6 numeric digits (‘0’ - ‘9’) in base64">
                                  <span>keyOob(optional)</span>
                                  <input v-model="SBauthkeyOwn" placeholder="16-bytes hexadecimal key in base64">
                                  <span>keyOwn(optional)</span>
                                  <input v-model="SBauthkeyOob" placeholder=" 16-bytes hexadecimal key in base64">
                                </div>

                                <!-- NOT TESTED -->
                                <div v-else-if="selectedProperty==='encrypt'">
                                  <span>bondingKey</span>
                                  <input v-model="SBencryptbondingKey" placeholder="bonding key received from previous authentication response in Base64">
                                </div>

                                <br>

                                <div>
                                  <button @click="HandleSBsend()" class="button is-primary">Send</button>
                                </div>
                            </div>

                            <div>
                              <div>
                                <h1 class="has-text-weight-bold subtitle">JSON Logs</h1>
                              </div>

                              <br>

                              <div style="display: flex;">
                                <div style="margin-right: 20px;">
                                  <p>Requests</p>
                                  <textarea style="outline: none !important; border-color: black; box-shadow: 0 0 10px black; width: 350px; height: 500px;" v-model="jsonreqs" placeholder="JSON Requests Sent"></textarea>
                                </div>

                                <div>
                                  <p>Responses</p>
                                  <textarea style="outline: none !important; border-color: black; box-shadow: 0 0 10px black; width: 350px; height: 500px;" v-model="jsonresps" placeholder="JSON Responses Recieved"></textarea>
                                </div>
                              </div>
                            </div>
                          </div>
                      </section>
                  </div>
            </b-modal>
          </div>
      </div>
  </div>

</template>

<script>
/* eslint-disable */
import axios from "axios";
import Dygraph from 'dygraphs';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';

export default {
  name: 'BleDevice',
  data() {
    return {
      bleApList: [],
      numAps: 0,
      selectedDev: '',
      selectedDay: '',
      days: [],
      selectedAp: '',
      apsfordayble: [],
      dataCollection: [],
      isComponentModalActive: false,
      show: false,
      isLoading: false,
      fullPage: true,
      loader: 'dots',
      jsonreqs: '',
      jsonresps: '',
      status: '',
      statusString: '',
      SBchosenAP: '',
      uuidpair: [],
      curprops: [],
      totprops: {},
      SBsubbool: false,
      selectedUuidPair: '',
      selectedProperty: '',
      SBdata: '',
      SBcharacteristicval: '',
      SBauthmethod: '',
      SBauthbonding: false,
      SBauthpasskey: '',
      SBauthkeyOwn: '',
      SBauthkeyOob: '',
      SBencryptbondingKey: ''
    };
  },
  methods: {
    handleUuidChange() {
      // change props here for a specific pair here
      console.log("totprops: ", this.totprops);
      this.curprops = this.totprops[this.selectedUuidPair];
      this.selectedProperty = this.curprops[0];
    },
    handleDayChange() {
      this.apsfordayble = [];

      axios.post("http://127.0.0.1:3000/chartaps", {
        method: "POST",
        body: JSON.stringify({
          dev: this.selectedDev,
          date: this.selectedDay
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        for (let i = 0; i < res.data.data.length; i++) {
          this.apsfordayble.push(res.data.data[i].ap);
        }

        this.selectedAp = this.apsfordayble[0];

        this.showChart();
      });
    },
    showBle(dev) {
      this.selectedDev = dev;
      axios.post("http://127.0.0.1:3000/bledata", {
        method: "POST",
        body: JSON.stringify({
            device: this.selectedDev
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        console.log(res.data.data);
        this.numAps = 0;
        this.bleApList = [];

        for (let i = 0; i < res.data.data[0].access_points.length; i++) {
          this.bleApList.push(res.data.data[0].access_points[i]);
        }
        this.numAps = this.bleApList.length;
      });

      axios.get("http://127.0.0.1:3000/chartdates/?dev=" + this.selectedDev, {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        console.log("days:", res.data.data);

        for (let i = 0; i < res.data.data.length; i++) {
          this.days.push(res.data.data[i].date);
        }
        this.selectedDay = this.days[0];

        this.handleDayChange();
      });
    },
    HandleSBsend: function() {
      this.isLoading = true;

      // 0: char
      // 1: service
      let uuids = this.selectedUuidPair.split(" | ");
      console.log(uuids);

      axios.post("http://127.0.0.1:3000/southbound/" + this.selectedProperty, {
        method: "POST",
        body: JSON.stringify({
          dev: this.selectedDev,
          ap: this.SBchosenAP,
          characteristicUuid: uuids[0],
          data: this.SBdata,
          subscription: this.SBsubbool,
          value: this.SBcharacteristicval,
          method: this.SBauthmethod,
          bonding: this.SBauthbonding,
          passkey: this.SBauthpasskey,
          keyOwn: this.SBauthkeyOwn,
          keyOob: this.SBauthkeyOob,
          bondingKey: this.SBencryptbondingKey,
          serviceUuid: uuids[1],
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        this.jsonreqs += 'JSON Payload:\n' + JSON.stringify(res.data.payload, null, ' ') + '\nProperties:\n' + JSON.stringify(res.data.props, null, ' ') + '\n\n';
        this.isLoading = false
      });
    },
    SBconnect: function() {
      // json, device id
      //console.log(e.target[1].value, this.selectedDev);
      this.isLoading = true;

      // find ap with closest to 0 rssi
      axios.post("http://127.0.0.1:3000/avgrssible", {
          method: "POST",
          body: JSON.stringify({
            dev: this.selectedDev,
            aps: this.apsfordayble
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
      }).then((res) => {
          console.log("avg rssi values:", res.data.data);
          res.data.data.sort();
          this.SBchosenAP = res.data.data[0].dev;

          axios.post("http://127.0.0.1:3000/southbound/connect", {
            method: "POST",
            body: JSON.stringify({
              dev: this.selectedDev,
              ap: this.SBchosenAP
            }),
            headers: {
              "Content-type": "application/json; charset=UTF-8"
            }
          }).then((res) => {
            this.jsonreqs += 'JSON Payload:\n' + JSON.stringify(res.data.payload, null, ' ') + '\nProperties:\n' + JSON.stringify(res.data.props, null, ' ') + '\n\n';
            this.isLoading = false
          });
      });
    },
    showChart() {
      // generate dygraph
      this.dataCollection = [];

      axios.post("http://127.0.0.1:3000/chart", {
        method: "POST",
        body: JSON.stringify({
          dev: this.selectedDev,
          date: this.selectedDay,
          ap: this.selectedAp
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        //console.log("chart data:", res.data.data);
        let datastr = "Date,Value\n";
        for (let i = 0; i < res.data.data.length; i++) {
          const myArr = res.data.data[i].time.split("T");
          const ndate = (myArr[0].split("-")).join("/");
          const tmp = myArr[1].split("Z");
          let data = "" + ndate + " " + tmp[0] + "," + res.data.data[i].rssi + "\n";
          datastr += data;
          //this.dataCollection.push([data, res.data.data[i].rssi]);
        }

        this.setChart(datastr);
        this.isLoading = false;
      });
    },
    SBdisconnect: function() {
      this.isLoading = true;
      axios.post("http://127.0.0.1:3000/southbound/disconnect", {
        method: "POST",
        body: JSON.stringify({
          dev: this.selectedDev,
          ap: this.SBchosenAP
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        this.jsonreqs += 'JSON Payload:\n' + JSON.stringify(res.data.payload, null, ' ') + '\nProperties:\n' + JSON.stringify(res.data.props, null, ' ') + '\n\n';
        this.isLoading = false
      });
    },
    downloadChart() {
      domtoimage.toBlob(document.getElementById('dygraph'))
          .then(function(blob) {
            window.saveAs(blob, 'my-node.png');
          });
    },
    setChart(data){
      new Dygraph(this.$refs.dychart, data, {
        rollPeriod: 1,
        width: 800,
        height: 600
      });
    }
  },
  mounted() {
    this.$root.$on('bleProfile', (item) => {
      // your code goes here
      let connection = new WebSocket('ws://127.0.0.1:3000/');
      connection.onmessage = (event) => {
          try {
              const payload = JSON.parse(event.data);
              console.log(payload);
              // only add ble_data to table
              if (payload.hasOwnProperty('statusString')) {
                this.statusString = payload.statusString;
              }

              if (payload.hasOwnProperty('status')) {
                this.status = payload.status;
                this.jsonresps += 'JSON Payload:\n' + JSON.stringify(payload, null, ' ') + '\n\n';
              }

              if (payload.hasOwnProperty('characteristic')) {
                this.uuidpair = [];
                this.totprops = {};

                payload.characteristic.forEach( item => {
                  console.log("characteristic elem: ", item);

                  let tmppair = item.characteristicUuid + ' | ' + item.serviceUuid;
                  this.uuidpair.push(tmppair);

                  this.totprops[tmppair] = item.properties;
                });
                this.selectedUuidPair = this.uuidpair[0];
                this.handleUuidChange();
              }
          } catch (err) {
            console.error(err);
          }
      }
      this.isLoading = true;
      console.log("item and response in bledev profile:", item);
      this.showBle(item);
      this.show = true;
    });
  },
};
</script>