<template>
  <TransferFormCard @add-item="addItem"></TransferFormCard>
  <v-divider class="ma-4"></v-divider>
  <v-card class="ma-4">
    <v-data-table :headers="headers" :items="transfers" items-per-page="-1">
      <template #top>
        <v-toolbar color="white" density="compact">
          <v-toolbar-title>이체 관리</v-toolbar-title>
          <v-btn
            :icon="mdiMicrosoftExcel"
            :disabled="hasTransfers()"
            @click="exportExcel"
          ></v-btn>
          <v-btn
            :icon="mdiBroom"
            :disabled="hasTransfers()"
            @click="onDeleteAllClick()"
          >
          </v-btn>
        </v-toolbar>
      </template>
      <template #bottom>
        <div class="d-flex justify-center pa-2">
          <span class="ma-2"
            >총 이체 금액:
            <strong>
              {{
                '￦ ' +
                readableCurrency(
                  transfers
                    .map((transfer) => transfer.amount ?? 0)
                    .reduce((p: number, c: number) => p + c, 0),
                )
              }}</strong
            >
            <span class="pa-2 text-caption" style="color: gray"
              >({{ readableCurrency(transfers.length) }} 건)</span
            >
          </span>
        </div>
      </template>
      <template #[`item.bank`]="{ item }">
        <v-chip v-if="item.bank">{{ item.bank }}</v-chip>
      </template>
      <template #[`item.amount`]="{ item }">
        <div v-if="item.readonly" @dblclick="item.readonly = false">
          {{ '￦ ' + readableCurrency(item.amount) }}
        </div>
        <CurrencyTextField
          v-else
          v-model="item.amount"
          label=""
          autofocus
          @blur="item.readonly = true"
        ></CurrencyTextField>
      </template>
      <template #[`item.move`]>
        <v-icon
          class="draggable"
          :icon="mdiDrag"
          @mousedown="onMousedown"
        ></v-icon>
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
  <DeleteDialog
    v-model="deleteAllDialog"
    title="모두 삭제하시겠습니까?"
    submitLabel="모두 삭제"
    cancelLabel="취소"
    @delete-item="clear"
  ></DeleteDialog>
</template>
<script setup lang="ts">
import {
  mdiBroom,
  mdiCloseCircleOutline,
  mdiDrag,
  mdiMicrosoftExcel,
} from '@mdi/js';
import { storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';

import CommonSnackBar, {
  CommonSnackBarLevel,
} from '@/components/CommonSnackBar.vue';
import CurrencyTextField from '@/components/CurrencyTextField.vue';
import DeleteDialog from '@/components/DeleteDialog.vue';
import { createExcel } from '@/services/excelService';
import { excelDownload } from '@/services/fileService';
import { accountStore } from '@/store';
import TransferFormCard from '@/views/TransferFormCard.vue';

const store = accountStore();
const { transfers } = storeToRefs(store);

const headers = [
  {
    key: 'move',
    sortable: false,
  },
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
    key: 'bank',
    width: 200,
  },
  {
    title: '이체금액',
    align: 'start',
    key: 'amount',
    width: 200,
  },
  {
    key: 'actions',
    sortable: false,
  },
];
const snack: Ref<boolean> = ref(false);
const snackMessage: Ref<string> = ref('');
const snackLevel: Ref<CommonSnackBarLevel> = ref('confirm');

const needSwap: Ref<any> = ref();
const swapFrom: Ref<number> = ref(0);
const swapTo: Ref<number> = ref(0);

const tbody: Ref<any> = ref();
const table: Ref<any> = ref();
const dragElem: Ref<any> = ref();
const beforeElem: Ref<any> = ref(null);
const mouseDrag: Ref<boolean> = ref(false);
const mouseDownX: Ref<number> = ref(0);
const mouseDownY: Ref<number> = ref(0);
const mouseX: Ref<number> = ref(0);
const mouseY: Ref<number> = ref(0);
const currRow: Ref<any> = ref();

const deleteAllDialog: Ref<Boolean> = ref(false);

function addItem(item: any) {
  transfers.value.push({ ...item, readonly: true });
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

function getMouseCoords(e: any) {
  return {
    x: e.clientX,
    y: e.clientY,
  };
}

function getTargetRow(target: any): any {
  const elemName = target.tagName.toLowerCase();

  if (elemName === 'tr') return target;
  if (elemName === 'td') return target.closest('tr');

  return null;
}

function getStyle(target: any, styleName: any) {
  const compStyle = getComputedStyle(target);
  const style = compStyle[styleName] ?? null;

  return style;
}

function addDraggableRow(target: any) {
  dragElem.value = target.cloneNode(true);
  dragElem.value.classList.add('draggable-table__drag');
  dragElem.value.style.height = getStyle(target, 'height');
  dragElem.value.style.background = getStyle(target, 'backgroundColor');
  for (let i = 0; i < target.children.length; i += 1) {
    const oldTD = target.children[i];
    const newTD = dragElem.value.children[i];
    newTD.style.width = getStyle(oldTD, 'width');
    newTD.style.height = getStyle(oldTD, 'height');
    newTD.style.padding = getStyle(oldTD, 'padding');
    newTD.style.margin = getStyle(oldTD, 'margin');
  }

  table.value.appendChild(dragElem.value);

  const tPos = target.getBoundingClientRect();
  const dPos = dragElem.value.getBoundingClientRect();
  dragElem.value.style.bottom = `${dPos.y - tPos.y}px`;
  dragElem.value.style.left = '0px';
  document.dispatchEvent(
    new MouseEvent('mousemove', {
      view: window,
      cancelable: true,
      bubbles: true,
    }),
  );
}

function isIntersecting(
  min0: number,
  max0: number,
  min1: number,
  max1: number,
) {
  return (
    Math.max(min0, max0) >= Math.min(min1, max1) &&
    Math.min(min0, max0) <= Math.max(min1, max1)
  );
}

function updateCurrentRow(row: any) {
  currRow.value.classList.remove('is-dragging');
  currRow.value = row;
  currRow.value.classList.add('is-dragging');
}

function swapTransfer() {
  try {
    const transfer = transfers.value[swapFrom.value];
    transfers.value.splice(swapFrom.value, 1);
    transfers.value.splice(swapTo.value, 0, transfer);
  } catch (e) {
    console.error(e);
    snackMessage.value = `위치 변경을 실패하였습니다.`;
    snackLevel.value = 'error';
    snack.value = true;
  } finally {
    needSwap.value = false;
  }
}

function swapRow(row: any, index: any) {
  try {
    needSwap.value = true;
    beforeElem.value = Array.from(tbody.value.children).indexOf(row);
    swapFrom.value = Array.from(tbody.value.children).indexOf(currRow.value);
    swapTo.value = index;

    swapTransfer();
    updateCurrentRow(row);
  } catch (e) {
    console.error(e);
  }
}

function moveRow(x: number, y: number) {
  dragElem.value.style.transform = `translate3d(${x}px, ${y}px, 0)`;

  const dPos = dragElem.value.getBoundingClientRect();
  const currStartY = dPos.y;
  const currEndY = currStartY + dPos.height;
  const rows = tbody.value.children;

  for (let i = 0; i < rows.length; i += 1) {
    const rowElem = rows[i];
    const rowSize = rowElem.getBoundingClientRect();
    const rowStartY = rowSize.y;
    const rowEndY = rowStartY + rowSize.height;

    if (
      currRow.value !== rowElem &&
      isIntersecting(currStartY, currEndY, rowStartY, rowEndY) &&
      Math.abs(currStartY - rowStartY) < rowSize.height / 2 &&
      beforeElem.value !== Array.from(tbody.value.children).indexOf(rowElem)
    ) {
      swapRow(rowElem, i);
    }
  }
}

function onDeleteAllClick() {
  deleteAllDialog.value = true;
}

function onMousedown(e: any) {
  const tr = e.target.parentNode.parentNode.parentNode;
  const target = getTargetRow(tr);
  tbody.value = target.parentNode;
  table.value = target.parentNode.parentNode;
  if (target) {
    currRow.value = target;
    addDraggableRow(target);
    currRow.value.classList.add('is-dragging');

    const coords = getMouseCoords(e);
    mouseDownX.value = coords.x;
    mouseDownY.value = coords.y;
    mouseDrag.value = true;
  }
}

function onMousemove(e: any) {
  if (mouseDrag.value) {
    const coords = getMouseCoords(e);
    mouseX.value = coords.x - mouseDownX.value;
    mouseY.value = coords.y - mouseDownY.value;
    moveRow(mouseX.value, mouseY.value);
  }
}

function onMouseup() {
  if (mouseDrag.value) {
    currRow.value.classList.remove('is-dragging');
    table.value.removeChild(dragElem.value);
    dragElem.value = null;
    mouseDrag.value = false;
    beforeElem.value = null;
  }
}

document.addEventListener('mouseup', () => {
  onMouseup();
});

document.addEventListener('mousemove', (e) => {
  onMousemove(e);
});
</script>
<style lang="scss">
.v-data-table {
  .v-data-table__tr--clickable {
    cursor: default;
  }
}

.draggable-table__drag {
  text-transform: capitalize;
  position: absolute;
  width: 100%;
  border: 1px solid #000000;
  color: #000000;
  z-index: 10;
  cursor: grabbing;
  -webkit-box-shadow: 2px 2px 3px 0px rgba(0, 0, 0, 0.1);
  box-shadow: 2px 2px 3px 0px rgba(0, 0, 0, 0.1);
  opacity: 0.3;
}

.v-data-table {
  tr.is-dragging {
    td.v-data-table__td {
      background-color: #fae4ed;
    }
  }
}
</style>
