import * as React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from './table'
import { Button } from './button'
import { Badge } from './badge'
import { Checkbox } from './checkbox'
import { cn } from '../../lib/utils'

interface TableProps<T> {
    headers: {
        id: string
        label: string
        sortable?: boolean
    }[]
    data: T[]
    rows: Row[]
    selectedRow?: Row
    onRowClick?: (row: Row) => void
    onAllRowsClick?: () => onAllRows()
    setSelectedRow(null)
}
onRowSelect ?: (row: Row) => {
    const isSelected = selectedRow === row.id
    setSelectedRow(row)
    onAllRowsClick?.() => onAllRows())
}
  }

return (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    {headers.map((header) => (
                        <TableHead key={header.id}>
                            <TableCell key={header.label}>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={rows.includes(header.id)}
                                        onChange={(checked) => =>
                                            handleRowSelect(header.id, checked)
                                        }
                    : onCheckedChange(rows.includes(header.id))
                  }
                            </TableCell>
                            <TableCell key={header.id}>
                                <div className="text-sm font-medium">{header.label}</div>
                            </TableCell>
                            <TableCell key={header.id}
                  <div className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onSort(header.id)}
                                >
                                    <ArrowUpDown className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableRow>
                    ))}
            </TableHeader>
            <TableRow>
                {data.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell key={row.id}>
                            {row.cells.map((cell) => (
                                <TableCell key={cell.id}>
                                    <div className="text-sm">{cell.value}</div>
                                </TableCell>
                            ))}
                            <TableRow>
              ))}
                            </TableBody>
                        </Table>
                    </CardContent>
      </Card>
    </div>
)
}
