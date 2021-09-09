<template>
  <div style="background: whitesmoke; width: 100%;" v-if="show">
      <div style="display: flex;">
          <div style="margin-left:10px; margin-right: 80px; margin-top: 75px">
            <h1 class="has-text-weight-bold subtitle">Usb {{selectedUsb}}</h1>
            <p>Current Health Status: {{health}}</p>
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
      selectedUsb: '',
      health: '',
      show: false,
    };
  },
  methods: {
    showUsb(dev) {
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