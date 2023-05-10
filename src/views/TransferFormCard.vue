<template>
  <v-card elevation="2" class="add-transfer ma-4">
    <v-toolbar color="white" density="compact">
      <v-toolbar-title>이체 등록</v-toolbar-title>
      <v-btn
        variant="plain"
        :icon="mdiPlusCircleOutline"
        :disabled="!selected || !amount"
        @click="addItem"
      >
      </v-btn>
    </v-toolbar>
    <div class="pa-4">
      <v-autocomplete
        v-model:search="search"
        v-model="selected"
        label="거래처"
        variant="solo"
        density="compact"
        clearable
        return-object
        :items="items"
        :loading="loading"
        item-title="vendor"
        :custom-filter="keywordFilter"
        :hide-no-data="false"
        @update:search="updateSearch"
      >
        <template #item="{ props, item }">
          <v-list-item v-bind="props">
            <div class="d-flex flex-wrap">
              <v-list-item-subtitle>
                {{ item.raw.bank }}
              </v-list-item-subtitle>
              <v-divider class="ml-4 mr-4" vertical></v-divider>
              <v-list-item-subtitle>
                {{ item.raw.accountNumber }}
              </v-list-item-subtitle>
              <v-divider class="ml-4 mr-4" vertical></v-divider>
              <v-list-item-subtitle>
                {{ item.raw.accountHolder }}
              </v-list-item-subtitle>
            </div>
          </v-list-item>
        </template>
        <template #no-data>
          <v-list-item>
            <v-list-item-title>
              <div v-if="accounts.length > 0">
                데이터가 없습니다. <strong>{{ search }}</strong> 를
                <v-btn
                  class="mb-1"
                  variant="outlined"
                  density="compact"
                  @click="createAccountDialog = true"
                >
                  <strong>+ 등록</strong>
                </v-btn>
                하시겠습니까?
              </div>
              <div v-else>계좌 데이터를 불러오세요</div>
            </v-list-item-title>
          </v-list-item>
        </template>
        <template #append-item>
          <div v-if="accounts.length > 0" v-intersect="onScroll"></div>
        </template>
      </v-autocomplete>
      <div class="d-flex justify-center">
        <v-text-field
          v-model="accountNumber"
          variant="underlined"
          label="계좌번호"
          density="compact"
          readonly
        ></v-text-field>
        <v-text-field
          v-model="bank"
          class="ml-4"
          variant="underlined"
          density="compact"
          readonly
          label="개설은행"
        ></v-text-field>
        <CurrencyTextField
          class="ml-4"
          v-model="amount"
          label="이체금액"
          :readonly="!selected"
        ></CurrencyTextField>
      </div>
    </div>
  </v-card>
  <AccountRegistrationDialog
    v-model="createAccountDialog"
    @create-account="createAccount"
  ></AccountRegistrationDialog>
</template>

<script setup lang="ts">
import { mdiPlusCircleOutline } from '@mdi/js';
import debounce from 'lodash.debounce';
import { storeToRefs } from 'pinia';
import { computed, Ref, ref, watch } from 'vue';

import CurrencyTextField from '@/components/CurrencyTextField.vue';
import { Account } from '@/models';
import { accountStore } from '@/store';
import AccountRegistrationDialog from '@/views/AccountRegistrationDialog.vue';

const emit = defineEmits(['addItem']);

const store = accountStore();
const { accounts, load } = storeToRefs(store);

const selected: Ref<Account | undefined> = ref();
const search: Ref<string> = ref('');
const items: Ref<Account[]> = ref([]);
const amount: Ref<any> = ref();
const oldAmount: Ref<any> = ref();
const createAccountDialog = ref(false);
const loading = false;
const accountNumber = computed(() => selected.value?.accountNumber);
const bank = computed(() => selected.value?.bank);
const pageSize = 10;
let page = 0;

function toNumber(currecny: string) {
  return Number(`${currecny}`.split(',').join(''));
}

function addItem() {
  emit('addItem', {
    ...selected.value,
    amount: toNumber(amount.value),
  });
  selected.value = undefined;
  amount.value = undefined;
  oldAmount.value = undefined;
}

function keywordFilter(itemTitle: string, current: string, item: any) {
  return new RegExp(current).test(item.value.keyword);
}

function createAccount(account: Account) {
  selected.value = account;
}

function updateSearch() {
  page = 0;
  if (search.value === '') {
    items.value = accounts.value.slice(page * pageSize, (page + 1) * pageSize);
  } else {
    items.value = accounts.value
      .filter((account) => new RegExp(search.value).test(account.keyword))
      .slice(page * pageSize, (page + 1) * pageSize);
  }
}

const onScroll = debounce((isIntersecting) => {
  if (isIntersecting) {
    page += 1;
    const appendItems = accounts.value
      .filter((account) => new RegExp(search.value).test(account.keyword))
      .slice(page * pageSize, (page + 1) * pageSize);
    items.value = items.value.concat(appendItems);
  }
}, 200);

watch(load, () => {
  if (load) {
    page = 0;
    items.value = accounts.value.slice(page * pageSize, (page + 1) * pageSize);
    load.value = false;
  }
});
</script>
<style lang="scss" scoped>
.add-transfer {
  position: sticky;
  top: 0;
  z-index: 999;
}
</style>
