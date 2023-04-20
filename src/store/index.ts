import { defineStore } from 'pinia';
import { computed, Ref, ref } from 'vue';

import { Account, Transfer } from '@/models';

export const accountStore = defineStore('account', () => {
  const initAccountCount: Ref<number> = ref(0);
  const accounts: Ref<Account[]> = ref([]);
  const transfers: Ref<Transfer[]> = ref([]);
  const load: Ref<boolean> = ref(false);

  const accountCount = computed(() => accounts.value.length);

  function updateAccounts(newAccounts: Account[]) {
    accounts.value = newAccounts.slice();
  }

  function addAccount(account: Account) {
    accounts.value.push(account);
  }

  return {
    initAccountCount,
    accounts,
    transfers,
    load,
    accountCount,
    updateAccounts,
    addAccount,
  };
});
