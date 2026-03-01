import { CourseScore } from "@/types/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { flexRender, Table as TableType } from "@tanstack/react-table";
import { columns } from "./columns";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function TableTable({ table }: { table: TableType<CourseScore> }) {
  return (
    <div className="desktop:block hidden pt-4">
      <div className="bg-accent border-border rounded-md border w-[90vw] max-w-[90vw] overflow-x-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        (header.column.columnDef.meta as { className?: string })?.className
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 group"
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        (cell.column.columnDef.meta as { className?: string })?.className,
                        cell.column.id === "campus" && "whitespace-normal"
                      )}
                    >
                      <a
                        href={`/${row.original.sigle}`}
                        className="block w-full h-full text-inherit no-underline"
                        aria-label={index === 0 ? `Ver detalles del curso ${row.original.sigle} - ${row.original.name}` : undefined}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </a>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4 w-[90vw] max-w-[90vw]">
        <div className="text-foreground-muted-dark flex-1 text-sm">
          {table.getFilteredRowModel().rows.length} cursos encontrados
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
