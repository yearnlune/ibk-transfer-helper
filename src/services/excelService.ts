import ExcelJS from 'exceljs';

import { BankCode, Transfer } from '@/models';

interface TransferExcel {
  bankCode: number;
  accountNumber: string;
  amount: number;
  check?: number;
  user: string;
  cms?: number;
}

const defaultColumns = [
  {
    header: '은행코드',
    key: 'bankCode',
  },
  {
    header: '계좌번호',
    key: 'accountNumber',
    width: 20,
  },
  {
    header: '입금액',
    key: 'amount',
    width: 20,
    style: {
      numFmt: '"￦"#,##0',
    },
  },
  {
    header: '자기앞수표',
    key: 'check',
    width: 12,
  },
  {
    header: '수취인명',
    key: 'user',
    width: 16,
  },
  {
    header: 'CMS기관코드',
    key: 'cms',
    width: 14,
  },
];

function process(transfer: Transfer): TransferExcel {
  return {
    bankCode:
      BankCode[transfer.bank || 'UNKNOWN'] > 0
        ? BankCode[transfer.bank || 'UNKNOWN']
        : transfer.bank,
    accountNumber: transfer.accountNumber,
    amount: Number(transfer.amount),
    user: transfer.accountHolder || transfer.vendor,
  } as TransferExcel;
}

export async function createExcel(data: Transfer[]) {
  const workBook = new ExcelJS.Workbook();
  workBook.addWorksheet('sheet1');

  const sheet = workBook.getWorksheet('sheet1');
  sheet.columns = defaultColumns;

  data
    .map((transfer: Transfer) => process(transfer))
    .forEach((transfer: TransferExcel) => {
      sheet.addRow(transfer);
    });

  return workBook.xlsx.writeBuffer();
}
