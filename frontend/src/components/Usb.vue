<template>
  <div style="background: whitesmoke; width: 100%;" v-if="show">
     <loading-overlay :active="isLoading" :is-full-page="fullPage" :loader="loader" />
      <div style="display: flex;">
          <div style="margin-left:10px; margin-right: 80px; margin-top: 75px">
            <h1 class="has-text-weight-bold subtitle">{{selectedUsb}}</h1>
            <p>Current Health Status: {{health}}</p>
          </div>
      </div>

    <!--<b-modal :active.sync="isComponentModalActive" has-modal-card full-screen>
                <form v-on:submit.prevent="onSubmit">

                  <div class="modal-card" style="width: 1450px; height: 1300px;">
                      <header class="modal-card-head">
                          <p class="modal-card-title">SouthBound API for {{ selectedDev }}</p>
                      </header>
                      <section class="modal-card-body">
                        <file-select v-model="file"></file-select>
                      </section>
                      <footer class="modal-card-foot">
                        <button class="button is-primary">Send</button>
                        <p style="color: green; margin-top: 20px; margin-left: 10px;">{{ southBoundResult }}</p>
                      </footer>
                  </div>
                </form>
            </b-modal>-->
  </div>

</template>

<script>
import axios from "axios";
//import FileSelect from "@/components/FileSelect";

export default {
  name: 'Radio',
  /*components: {
    FileSelect
  },*/
  data() {
    return {
      selectedUsb: '',
      health: '',
      isLoading: false,
      fullPage: false,
      loader: 'dots',
      show: false,
    };
  },
  methods: {
    showUsb(dev) {
      this.isLoading = true;
      this.selectedUsb = dev;

      axios.get("http://127.0.0.1:3000/usbprofile?dev=" + this.selectedUsb, {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        console.log("usb data:", res.data.data[0]);
        let tmpdata = res.data.data[0];

        this.health = tmpdata.last_health_status;
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
    this.$root.$on('usbProfile', (item) => {
      // your code goes here
      console.log("item and response in usb profile:", item);
      this.showUsb(item);
      this.show = true;
    });
  },
};
</script>