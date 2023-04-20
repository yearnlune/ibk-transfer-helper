import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { DateTime } from 'luxon';

export function excelDownload(data: ExcelJS.Buffer, fileName?: string) {
  const name = fileName || `${DateTime.now().toFormat('yyyyMMdd')}.xlsx`;
  FileSaver.saveAs(
    new Blob([data], { type: 'application/vnd.ms-excel' }),
    name,
  );
}

export function csvDownload(data: string, fileName?: string) {
  const name = fileName || `${DateTime.now().toFormat('yyyyMMdd')}.csv`;
  FileSaver.saveAs(new Blob([data], { type: 'text/csv;charset=utf-8' }), name);
}
