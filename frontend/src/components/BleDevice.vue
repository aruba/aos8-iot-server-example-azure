<template>
  <div style="background: whitesmoke; width: 100%;" v-if="show">
      <div style="display: flex;">
          <div style="margin-left:10px; margin-right: 60px; margin-top: 75px">
            <h1 class="has-text-weight-bold subtitle">Device {{selectedDev}}</h1>
            <p>Reported by {{numAps}} total Access Points:</p>
            <ul>
              <li style="margin-bottom: 10px; margin-left: 40px; list-style-type: circle; display: list-item;" v-for="(bleAp, i) in bleApList" :key="i">{{bleAp}}</li>
            </ul>
          </div>

          <div>
            <div style="float: right; margin-top: 10px; margin-bottom: 25px;">
              <b-button @click="isComponentModalActive = true">Control this Device</b-button>

              <b-modal :active.sync="isComponentModalActive" has-modal-card>
                <form action="">
                  <div class="modal-card" style="width: 700px; height: 700px;">
                      <header class="modal-card-head">
                          <p class="modal-card-title">SouthBound API for {{selectedDev}}</p>
                      </header>
                      <section class="modal-card-body">
                        <file-select v-model="file"></file-select>
                      </section>
                      <footer class="modal-card-foot">
                          <button class="button is-primary">Send</button>
                      </footer>
                  </div>
                </form>
              </b-modal>
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

          </div>
      </div>
  </div>

</template>

<script>
import axios from "axios";
import Dygraph from 'dygraphs';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import FileSelect from './FileSelect.vue';

export default {
  name: 'BleDevice',
  components: {
    FileSelect
  },
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
      file: null,
      show: false,
    };
  },
  methods: {
    handleDayChange() {
      console.log(this.selectedDay, this.selectedDev);
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
        console.log("ap data:", res.data.data);

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
          //console.log("myarr:", myArr);
          const tmp = myArr[1].split("Z");
          //console.log("tmp:", tmp);
          let data = "" + ndate + " " + tmp[0] + "," + res.data.data[i].rssi + "\n";
          //console.log("data:", data);
          datastr += data;
          //this.dataCollection.push([data, res.data.data[i].rssi]);
        }

        this.setChart(datastr);
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
      console.log("item and response in bledev profile:", item);
      this.showBle(item);
      this.show = true;
    });
  },
};
</script>