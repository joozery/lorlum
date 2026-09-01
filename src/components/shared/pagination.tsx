import { Button } from "@/components/ui/button";

interface PaginationProps {
  total: number;
  shown: number;
  currentPage?: number;
}

export function Pagination({ total, shown, currentPage = 1 }: PaginationProps) {
  return (
    <div className="flex items-center justify-between text-sm text-gray-500">
      <p>แสดง {shown} จาก {total} รายการ</p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={currentPage === 1}>ก่อนหน้า</Button>
        <Button variant="outline" size="sm" className="bg-gray-900 text-white border-gray-900">
          {currentPage}
        </Button>
        <Button variant="outline" size="sm">{currentPage + 1}</Button>
        <Button variant="outline" size="sm">ถัดไป</Button>
      </div>
    </div>
  );
}
