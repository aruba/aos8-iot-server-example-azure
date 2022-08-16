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