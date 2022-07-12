<!-- 
  Copyright 2022 Hewlett Packard Enterprise Development LP. 
-->

<template>
  <div>
    <loading-overlay :active="isLoading" :is-full-page="fullPage" :loader="loader" />
    <section class="section is-vcentered">
      <h1 style="font-size: xx-large; color: azure">Select from Available Dates</h1>
      <multiselect v-model="selected" :options="data" placeholder="Select a date" label="date" track-by="date" @select="populateTable"></multiselect>
      <br>
      <div style="background: white; height: 100px;">
        <h1 style="font-size: xx-large;">Time Series Data for {{selected.date}}</h1>
        <b-checkbox class="checkbox"
               v-model="live"
               v-if="selected.date === todaydate"
               style="font-size: medium;">
          Stream Live Data
        </b-checkbox>
        <b-checkbox class="checkbox" disabled v-else style="font-size: medium">Stream Live Data</b-checkbox>
      </div>

      <div>
        <v-app id="inspire">
          <v-card>
            <v-card-title>
              <v-text-field
                v-model="search"
                append-icon="search"
                label="Filter by keyword..."
                single-line
                hide-details
              ></v-text-field>
            </v-card-title>
            <v-data-table
              :headers="headers"
              :items="timeseries"
              :search="search"
              :items-per-page="5"
              class="elevation-1"
            ></v-data-table>
          </v-card>
        </v-app>
      </div>
    </section>
  </div>
</template>

<script>
/* eslint-disable */
import axios from "axios";
import Multiselect from 'vue-multiselect'

let today = new Date();
let dd = today.getDate();
let mm = today.getMonth() + 1;
let yyyy = today.getFullYear();
if (dd < 10) {
  dd = '0' + dd;
}
if (mm < 10) {
  mm = '0' + mm;
}
today = mm + '/' + dd + '/' + yyyy;

export default {
  name: 'Table',
  components: {
    Multiselect
  },
  data() {
    return {
      timeseries: [],
      data: [],
      selected: {date: today},
      todaydate: today,
      live: true,
      search: '',
      isLoading: false,
      fullPage: false,
      loader: 'dots',
      headers: [
        { text: 'Timestamp', value: 'time' },
        { text: 'Device', value: 'device' },
        { text: 'RSSI', value: 'rssi' },
        { text: 'BLE Data', value: 'ble_data' },
        { text: 'Frame Type', value: 'frame_type' },
        { text: 'Mac Address Type', value: 'mac_addr_type' },
        { text: 'Reported by AP', value: 'ap' }
      ],
    };
  },
  mounted: function(){
      let connection = new WebSocket('ws://127.0.0.1:3000/');
      connection.onmessage = (event) => {
        try {
          // only want to stream live data if user is viewing current day
          if (this.selected.date === this.todaydate && this.live) {
            const payload = JSON.parse(event.data);
            // only add ble_data to table
            if (payload.hasOwnProperty('ble_data')) {
              console.log("in property test");
              this.timeseries.unshift(payload);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
  },
  methods: {
    populateTable(selectedOption) {
      this.isLoading = true;
      this.timeseries = [];

      axios.post("http://127.0.0.1:3000/tsdata", {
        method: "POST",
        body: JSON.stringify({
          date: selectedOption.date
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        this.timeseries = res.data.data;
        this.isLoading = false;
      });
    },
    getDbData() {
      this.isLoading = true;

      axios.get("http://127.0.0.1:3000/dates", {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        console.log("dates:", res.data);

        for (let i = 0; i < res.data.data.length; i++) {
          this.data.push(res.data.data[i]);
        }
      });

      axios.post("http://127.0.0.1:3000/tsdata", {
        method: "POST",
        body: JSON.stringify({
          date: this.selected.date
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        this.timeseries = res.data.data;
        //console.log(this.timeseries);
        this.isLoading = false;
      });
    }
  },
  // functions and variables laoded on page load
  beforeMount() {
    this.getDbData();
  }
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>
</style>