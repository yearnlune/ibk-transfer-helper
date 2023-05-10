<template>
  <v-text-field
    v-model="amount"
    :maxlength="maxCount(displayMaxCount)"
    density="compact"
    prefix="￦"
    :variant="variant"
    :readonly="readonly"
    :rules="[rules.currency]"
    @input="onInputAmount"
  >
    <template #counter>
      {{ counting(amount) }} / {{ displayMaxCount }}
    </template></v-text-field
  >
</template>
<script setup lang="ts">
import { Ref, ref, watchEffect } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: any;
    variant?: string;
    readonly?: boolean;
  }>(),
  {
    modelValue: '',
    variant: 'underlined',
    readonly: false,
  },
);
const emits = defineEmits(['update:modelValue']);
const amount: Ref<any> = ref();
const oldAmount: Ref<any> = ref();
const displayMaxCount = 16;

const rules = {
  currency: (v: any) =>
    /^[0-9]{0,3}(,[0-9]{3})*$/.test(v) || `이체금액을 적어주세요. ${v}`,
};

function toCurrency(numberString: string) {
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? '';
}

function toNumber(currecny: string) {
  return Number(`${currecny}`.split(',').join(''));
}

function counting(value: any) {
  let count = 0;
  if (value) {
    count = `${toNumber(value)}`.length;
  }
  return count;
}

function maxCount(max: number) {
  return (4 * max) / 3;
}

function emitModelValue() {
  emits('update:modelValue', toNumber(amount.value));
}

function onInputAmount() {
  const plain = toNumber(amount.value);
  if (/[0-9]{4}/.test(amount.value)) {
    amount.value = toCurrency(`${plain}`);
  }

  if (amount.value !== '' && !/^[0-9]{1,3}(,[0-9]{3})*$/.test(amount.value)) {
    amount.value = oldAmount.value;
  }

  oldAmount.value = amount.value;

  if (plain) {
    amount.value = toCurrency(`${plain}`);
    emitModelValue();
  }
}

watchEffect(() => {
  amount.value = toCurrency(`${props.modelValue}`);
  oldAmount.value = toCurrency(`${props.modelValue}`);
});
</script>
