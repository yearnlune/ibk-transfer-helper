<template>
  <TransferFormCard @add-item="addItem"></TransferFormCard>
  <v-divider class="ma-4"></v-divider>
  <v-card class="ma-4">
    <v-data-table
      :headers="headers"
      :items="transfers"
      must-sort
      items-per-page="-1"
    >
      <template #top>
        <v-toolbar color="white" density="compact">
          <v-toolbar-title>이체 관리</v-toolbar-title>
          <v-btn
            :icon="mdiMicrosoftExcel"
            :disabled="hasTransfers"
            @click="exportExcel"
          ></v-btn>
          <v-btn
            :icon="mdiBroom"
            :disabled="hasTransfers"
            @click="clear"
          ></v-btn>
        </v-toolbar>
      </template>
      <template #[`item.bank`]="{ item }">
        <v-chip v-if="item.raw.bank">{{ item.raw.bank }}</v-chip>
      </template>
      <template #[`item.amount`]="{ item }">
        {{ '￦' + readableCurrency(item.raw.amount) }}
      </template>
      <template #[`item.actions`]="{ index }">
        <v-icon :icon="mdiCloseCircleOutline" @click="deleteItem(index)" />
      </template>
    </v-data-table>
  </v-card>
  <CommonSnackBar
    v-model="snack"
    :message="snackMessage"
    :level="snackLevel"
  ></CommonSnackBar>
</template>
<script setup lang="ts">
import { mdiBroom, mdiCloseCircleOutline, mdiMicrosoftExcel } from '@mdi/js';
import { storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';

import CommonSnackBar, {
  CommonSnackBarLevel,
} from '@/components/CommonSnackBar.vue';
import { createExcel } from '@/services/excelService';
import { excelDownload } from '@/services/fileService';
import { accountStore } from '@/store';
import TransferFormCard from '@/views/TransferFormCard.vue';

const store = accountStore();
const { transfers } = storeToRefs(store);

const headers = [
  {
    title: '거래처',
    align: 'start',
    key: 'vendor',
  },
  {
    title: '예금주',
    align: 'start',
    key: 'accountHolder',
  },
  {
    title: '계좌번호',
    align: 'start',
    key: 'accountNumber',
  },
  {
    title: '은행',
    align: 'start',
    sortable: true,
    key: 'bank',
    width: 200,
  },
  {
    title: '이체금액',
    align: 'start',
    sortable: true,
    key: 'amount',
    width: 200,
  },
  {
    key: 'actions',
  },
];
const snack: Ref<boolean> = ref(false);
const snackMessage: Ref<string> = ref('');
const snackLevel: Ref<CommonSnackBarLevel> = ref('confirm');

function addItem(item: any) {
  transfers.value.push(item);
}

function deleteItem(index: number) {
  transfers.value?.splice(index, 1);
}

function readableCurrency(amount: number) {
  return Number(amount).toLocaleString();
}

function clear() {
  transfers.value = [];
}

function hasTransfers() {
  return !(transfers.value?.length > 0);
}

async function exportExcel() {
  createExcel(transfers.value)
    .then((excel) => excelDownload(excel))
    .catch((e) => {
      console.error(e);
      snackMessage.value = `다운로드에 실패하였습니다.`;
      snackLevel.value = 'error';
      snack.value = true;
    });
}
</script>
