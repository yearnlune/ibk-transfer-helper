<template>
  <v-dialog v-model="dialogVisible" width="400">
    <v-card>
      <v-card-title class="pl-6"> 신규 계좌 등록 </v-card-title>
      <v-divider class="ml-6 mr-6" />
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              v-model="vendor"
              variant="outlined"
              placeholder="한국산업"
              :rules="[rules.reservedWord]"
            >
              <template #label>
                <span>거래처<span style="color: red"> *</span></span>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <BankAutocomplete v-model="bank"></BankAutocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="accountNumber"
              variant="outlined"
              placeholder="1234-123-123456"
              :rules="[rules.accountNumber]"
              ><template #label>
                <span>계좌번호<span style="color: red"> *</span></span>
              </template></v-text-field
            >
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="accountHolder"
              variant="outlined"
              placeholder="홍길동"
              :rules="[rules.reservedWord]"
              ><template #label>
                <span>예금주</span>
              </template></v-text-field
            >
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="d-flex mr-6 pa-0">
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="onClickCancel"> 취소 </v-btn>
        <v-btn
          color="grey"
          :loading="loading"
          :disabled="!isFormValid"
          variant="text"
          @click="createAccount"
          >등록</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { computed, Ref, ref } from 'vue';

import BankAutocomplete from '@/components/BankAutocomplete.vue';
import { Account } from '@/models';
import { accountStore } from '@/store';

const emit = defineEmits(['update:modelValue', 'createAccount']);

const store = accountStore();
const { addAccount } = store;

const dialogVisible: Ref<boolean> = ref(false);
const loading = ref(false);
const vendor: Ref<string> = ref('');
const accountHolder: Ref<string> = ref('');
const accountNumber: Ref<string> = ref('');
const bank: Ref<any> = ref([]);

const rules = {
  required: (v: any) => !!v || '이체금액을 적어주세요.',
  number: (v: any) => /^\d+$/.test(v) || '숫자를 적어주세요',
  accountNumber: (v: any) => /^[0-9-]+$/.test(v) || '계좌번호를 적어주세요',
  reservedWord: (v: any) => !/,/.test(v) || '쉼표(,)는 포함될 수 없습니다',
};

const isFormValid = computed(
  () =>
    vendor.value.length > 0 &&
    bank.value.length > 0 &&
    accountNumber.value.length > 0,
);

function emitModelValue() {
  dialogVisible.value = false;
  emit('update:modelValue', dialogVisible.value);
}

function onClickCancel() {
  vendor.value = '';
  accountHolder.value = '';
  accountNumber.value = '';
  bank.value = [];
  loading.value = false;
  emitModelValue();
}

function emitNewAccount(newAccount: Account) {
  emit('createAccount', newAccount);
}

function createAccount() {
  loading.value = true;
  const newAccount: Account = {
    vendor: vendor.value,
    accountHolder: accountHolder.value,
    accountNumber: accountNumber.value,
    bank: bank.value,
    keyword: accountHolder.value
      ? `${vendor.value}:${accountHolder.value}`
      : vendor.value,
  };
  addAccount(newAccount);
  emitNewAccount(newAccount);
  onClickCancel();
}
</script>
