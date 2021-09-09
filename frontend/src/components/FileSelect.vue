<template>
  <div>
    <label class="file-select">
      <div class="select-button is-primary">
        <span v-if="value">Selected File: {{value.name}}</span>
        <span v-else>Upload JSON Document</span>
      </div>
      <input type="file" @change="handleFileChange"/>

    </label>

    <br>

    <div>
      <textarea style="outline: none !important; border-color: black; box-shadow: 0 0 10px black; width: 100%; height: 400px;" v-model="message" placeholder="your json here"></textarea>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: File
  },
  data() {
    return {
      message: ''
    };
  },
  methods: {
    handleFileChange(e) {
      let file = e.target.files[0];
      let reader = new FileReader();
      reader.onload = (event) => {
        // The file's text will be printed here
        //console.log(JSON.parse(event.target.result));
        this.message = event.target.result;
      }

      reader.readAsText(file);

      this.$emit('input', file);
    }
  }
}
</script>

<style scoped>
.file-select > .select-button {
  padding: 1rem;
  color: white;
  background-color: rebeccapurple;

  border-radius: .3rem;

  text-align: center;
  font-weight: bold;
}

.file-select > .select-button:hover {
  background-color: mediumpurple;
}

.file-select > input[type="file"] {
  display: none;
}
</style>