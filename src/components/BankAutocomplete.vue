<template>
  <v-autocomplete
    v-model:search="search"
    v-model="selected"
    variant="outlined"
    :items="banks"
    clearable
    @update:model-value="emitBank"
  >
    <template #label>
      <span>은행<span style="color: red"> *</span></span>
    </template>
  </v-autocomplete>
</template>
<script setup lang="ts">
import { Ref, ref } from 'vue';

const emits = defineEmits(['update:modelValue']);

const selected: Ref<any[]> = ref([]);
const search: Ref<string> = ref('');
const banks = [
  '기업은행',
  '국민은행',
  '우리은행',
  '신한은행',
  '하나은행',
  '농협은행',
  '지역농축협',
  'SC은행',
  '한국씨티은행',
  '우체국',
  '경남은행',
  '광주은행',
  '대구은행',
  '도이치',
  '부산은행',
  '산림조합',
  '산업은행',
  '저축은행',
  '새마을금고',
  '수협',
  '신협',
  '전북은행',
  '제주은행',
  'BOA',
  'HSBC',
  'JP모간',
  '교보증권',
  '대신증권',
  '미래에셋증권',
  '유안타증권',
  '메리츠증권',
  '부국증권',
  '삼성증권',
  '솔로몬투자증권',
  '신영증권',
  '신한금융투자',
  'NH투자증권',
  '유진투자증권',
  '이베스트증권',
  '키움증권',
  '하나증권',
  '하이투자',
  '한국투자',
  '한화증권',
  'KB증권',
  '현대차증권',
  '케이프투자증권',
  'SK증권',
  '중국공상은행',
  '카카오페이증권',
  'BNK투자증권',
  'IBK투자증권',
  '다올투자증권',
  '비엔피파리바은행',
  '중국건설은행',
  '중국은행서울지점',
  '카카오뱅크',
  '케이뱅크',
  '토스뱅크',
  '토스증권',
  '한국포스증권',
];

function emitBank(bank: string) {
  emits('update:modelValue', bank);
}
</script>
