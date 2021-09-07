<template>
  <v-app id="inspire" class="has-background-grey">
    <div style="display: flex;">
      <div>
        <b-sidebar
            position="static"
            :mobile="mobile"
            :expand-on-hover="expandOnHover"
            :reduce="reduce"
            :delay="expandWithDelay ? 500 : null"
            type="is-light"
            v-model="searchDev"
        >
          <div class="p-1">
            <div class="block">
              <b-menu class="is-custom-mobile">
                <b-menu-list label="Device Profiles">
                    <b-autocomplete
                        rounded
                        v-model="searchDev"
                        :data="filteredDataArray"
                        placeholder="search for a device"
                        icon="magnify"
                        :open-on-focus="true"
                        field="dev"
                        clearable
                        @select="option => (handleSearch(option))">
                        <template #empty>No results found</template>
                    </b-autocomplete>

                  <br>

                  <b-menu-item icon="view-dashboard" label="Access Points">
                    <b-menu-item icon="apps" v-for="ap in accesspoints" :key="ap.device_id">
                      <template #label>
                        <span v-on:click="handleEvent($event, 'ap')">{{ap.device_id}}</span>
                      </template>
                    </b-menu-item>
                  </b-menu-item>

                  <b-menu-item icon="view-dashboard" label="Radio Devices">
                    <b-menu-item icon="apps" v-for="radio in radios" :key="radio.mac_addr">
                      <template #label>
                        <span v-on:click="handleEvent($event, 'radio')">{{radio.mac_addr}}</span>
                      </template>
                    </b-menu-item>
                  </b-menu-item>

                  <b-menu-item icon="view-dashboard" label="BLE Devices">
                    <b-menu-item icon="apps" v-for="bledev in bledevs" :key="bledev.device_identifier">
                      <template #label>
                        <span v-on:click="handleEvent($event, 'ble')">{{bledev.device_identifier}}</span>
                      </template>
                    </b-menu-item>
                  </b-menu-item>

                  <b-menu-item icon="view-dashboard" label="USB Devices">
                    <b-menu-item icon="apps" v-for="usb in usbs" :key="usb.id">
                      <template #label>
                        <span v-on:click="handleEvent($event, 'usb')">{{usb.id}}</span>
                      </template>
                    </b-menu-item>
                  </b-menu-item>
                </b-menu-list>
              </b-menu>

            </div>
          </div>
        </b-sidebar>
      </div>

      <BleDevice v-if="profile=='ble'"></BleDevice>
      <AccessPoint v-if="profile=='ap'"></AccessPoint>
      <Radio v-if="profile=='radio'"></Radio>
      <Usb v-if="profile=='usb'"></Usb>
    </div>
  </v-app>
</template>

<script>
/* eslint-disable */
import axios from "axios";
import BleDevice from "../components/BleDevice.vue";
import AccessPoint from "../components/AccessPoint.vue";
import Radio from "../components/Radio.vue";
import Usb from "../components/Usb.vue";

export default {
  name: 'Stats',
  components: {
    BleDevice,
    AccessPoint,
    Radio,
    Usb
  },
  data() {
    return {
      alldevs: [],
      bledevs: [],
      accesspoints: [],
      usbs: [],
      radios: [],
      expandOnHover: false,
      expandWithDelay: false,
      mobile: "reduce",
      reduce: false,
      searchDev: '',
      profile: '',
    };
  },
  computed: {
    filteredDataArray() {
      return this.alldevs.filter((option) => {
        return option.dev
            .toString()
            .toLowerCase()
            .indexOf(this.searchDev.toLowerCase()) >= 0
      })
    }
  },
  methods: {
    handleSearch(option) {
      if (option.type === 'ble') {
        // ble component function
        this.$root.$emit('bleProfile', option.dev);
      } else if (option.type === 'ap') {
        // ap component function
        this.$root.$emit('apProfile', option.dev);
      } else if (option.type === 'radio') {
        // radio component function
        this.$root.$emit('radioProfile', option.dev);
      } else if (option.type === 'usb') {
        // usb component function
        this.$root.$emit('usbProfile', option.dev);
      }

      this.profile = option.type;
    },
    handleEvent(e, type) {
      //console.log(e);
      if (type === 'ble') {
        // ble component function
        this.$root.$emit('bleProfile', e.target.innerText);
      } else if (type === 'ap') {
        // ap component function
        this.$root.$emit('apProfile', e.target.innerText);
      } else if (type === 'radio') {
        // radio component function
        this.$root.$emit('radioProfile', e.target.innerText);
      } else if (type === 'usb') {
        // usb component function
        this.$root.$emit('usbProfile', e.target.innerText);
      }

      this.profile = type;
    },
    getDbData() {
      axios.get("http://127.0.0.1:3000/tabledata/radiotable", {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        console.log(res.data);

        this.radios = res.data.data;
        for (let i of this.radios) {
          this.alldevs.push({"type": "radio", "dev": i.mac_addr});
        }
      });

      axios.get("http://127.0.0.1:3000/tabledata/usbtable", {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        console.log(res.data);

        this.usbs = res.data.data;
        for (let i of this.usbs) {
          this.alldevs.push({"type": "usb", "dev": i.id});
        }
      });

      axios.get("http://127.0.0.1:3000/tabledata/aptable", {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        console.log(res.data);

        this.accesspoints = res.data.data;
        for (let i of this.accesspoints) {
          this.alldevs.push({"type": "ap", "dev": i.device_id});
        }
      });

      axios.get("http://127.0.0.1:3000/tabledata/bledevtable", {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        console.log(res.data);

        this.bledevs = res.data.data;
        for (let i of this.bledevs) {
          this.alldevs.push({"type": "ble", "dev": i.device_identifier});
        }
      });
    },
  },
  // functions and variables loaded on page load
  beforeMount() {
    this.getDbData();
  }
};
</script>