<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const sampleData = [
  { id: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
  { id: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
  { id: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
  { id: 'INV004', status: 'Paid', method: 'Credit Card', amount: '$450.00' },
  { id: 'INV005', status: 'Paid', method: 'PayPal', amount: '$550.00' },
]
</script>

<template>
  <div class="p-4 border rounded-xl bg-card overflow-x-auto">
    <h2 class="text-xl font-semibold mb-4">Sample Data</h2>
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead class="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="invoice in sampleData" :key="invoice.id">
          <TableCell class="font-medium">{{ invoice.id }}</TableCell>
          <TableCell>{{ invoice.status }}</TableCell>
          <TableCell>{{ invoice.method }}</TableCell>
          <TableCell class="text-right">{{ invoice.amount }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
