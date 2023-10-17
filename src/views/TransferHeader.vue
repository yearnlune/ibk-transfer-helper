<template>
  <div class="ma-4">
    <strong :style="{ 'font-size': '32px' }">기업은행 이체</strong>
    <div class="d-flex justify-end">
      <v-responsive max-width="350">
        <v-file-input
          v-model="importFiles"
          accept=".csv, .txt"
          density="compact"
          width="100"
          label="계좌 데이터(CSV) 불러오기"
          clearable
          @change="update"
        ></v-file-input>
      </v-responsive>
    </div>
    <div class="d-flex mr-1" v-if="initAccountCount !== accounts.length">
      <v-spacer></v-spacer>
      <v-tooltip location="top">
        <template #activator="{ props }">
          <v-btn
            density="compact"
            class="ml-2"
            v-bind="props"
            :prepend-icon="mdiDownload"
            @click="exportAccounts"
          >
            데이터 업데이트가 감지 되었습니다.
          </v-btn>
        </template>
        내려받기
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiDownload } from '@mdi/js';
import { storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';

import { Account } from '@/models';
import { csvDownload } from '@/services/fileService';
import { accountStore } from '@/store';

const store = accountStore();
const importFiles: Ref<File[]> = ref([]);
const { updateAccounts } = store;
const { accounts, initAccountCount, load } = storeToRefs(store);
let fileName = '';

function update() {
  if (importFiles.value.length > 0) {
    const reader = new FileReader();
    let first = true;
    fileName = importFiles.value[0].name;
    reader.onload = (e) => {
      load.value = true;
      const text = e.target?.result?.toString() || '';

      if (text.includes('�')) {
        reader.dispatchEvent(new Event('invalid character error'));
      }

      const textLine: string[] = text.split('\n');
      const accountCandidates = textLine
        .filter((line) => !/계좌번호/.test(line))
        .map((line) => {
          const tokens = line.split(',');
          return {
            vendor: tokens[0],
            accountHolder: tokens[1],
            bank: tokens[2],
            accountNumber: tokens[3],
            keyword: tokens[1] ? `${tokens[0]}:${tokens[1]}` : tokens[0],
          } as Account;
        })
        .filter((account) => account.vendor);
      updateAccounts(accountCandidates);
      initAccountCount.value = accountCandidates.length;
    };
    reader.onerror = (e) => {
      console.error(e);
      if (first) {
        first = false;
        reader.readAsText(importFiles.value[0], 'euc-kr');
      }
    };
    reader.readAsText(importFiles.value[0], 'utf-8');
  }
}

function exportAccounts() {
  const header = '거래처,예금주,개설은행,계좌번호,';
  const csv = accounts.value
    .map(
      (account) =>
        `${account.vendor},${account.accountHolder},${account.bank},${account.accountNumber}`,
    )
    .join('\n');

  csvDownload(`${header}\n${csv}`, fileName);
}
</script>
