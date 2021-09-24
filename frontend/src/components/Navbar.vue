<template>
    <b-navbar class="is-dark">
        <template #brand>
            <b-navbar-item tag="router-link" :to="{ path: '/' }">
                <img
                    src="../assets/aruba.jpeg"
                    alt="Aruba Web App Azure IoTHub Demo"
                >
            </b-navbar-item>
        </template>
        <template #start>
            <b-navbar-item href="#">
                <h1 style="font-size: xx-large; color: azure">Aos8 Azure IoT-Hub Server Example</h1>
            </b-navbar-item>
        </template>
    </b-navbar>
</template>