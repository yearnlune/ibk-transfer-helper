<template>
  <v-snackbar
    v-model="snack"
    class="common-snack"
    :class="level"
    :location="location"
    :timeout="timeout"
    :color="level"
  >
    {{ message }}</v-snackbar
  >
</template>
<script setup lang="ts">
import { Ref, ref } from 'vue';

export type CommonSnackBarLevel = 'confirm' | 'success' | 'warning' | 'error';

withDefaults(
  defineProps<{
    message: string;
    timeout?: number;
    location?: any;
    level: CommonSnackBarLevel;
  }>(),
  {
    message: '',
    timeout: 3000,
    location: 'bottom left',
    level: 'confirm',
  },
);

const snack: Ref<boolean> = ref(false);
</script>
