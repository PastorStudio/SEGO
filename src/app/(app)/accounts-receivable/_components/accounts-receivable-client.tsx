
'use client'

import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type Invoice, type User, type Project } from "@/lib/definitions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMemo } from "react"
import { ClientDate, ClientNumber } from "@/components/client-only"

const COMMISSION_RATES = {
  'No Corporativo': 0.03,
  'Corporativo': 0.02,
}
const COMMISSION_THRESHOLD = 75000;

type EnrichedInvoice = Invoice & {
    eventType?: 'Corporativo' | 'No Corporativo';
};

type AccountsReceivableClientProps = {
    invoices: Invoice[];
    users: User[];
    projects: Project[];
}

export function AccountsReceivableClient({ invoices: initialInvoices, users, projects }: AccountsReceivableClientProps) {

  const invoices = useMemo(() => {
    const projectMap = new Map(projects.map(p => [p.id, p]));
    return initialInvoices.map(invoice => {
        const project = projectMap.get(invoice.projectId);
        return {
            ...invoice,
            eventType: project?.eventType
        }
    });
  }, [initialInvoices, projects])

  const getSalesPerson = (salespersonId: string): User | undefined => {
    return users.find(u => u.id === salespersonId);
  }

  const calculateCommissions = (invoice: EnrichedInvoice) => {
    const eventType = invoice.eventType || 'No Corporativo'; // Default to No Corporativo
    const rate = COMMISSION_RATES[eventType];
    
    let commissionableAmount = 0;
    const firstPayment = invoice.firstPayment || 0;
    const subsequentPayments = invoice.subsequentPayments || 0;

    if (firstPayment > COMMISSION_THRESHOLD) {
      commissionableAmount = firstPayment - COMMISSION_THRESHOLD;
    }
    
    const firstPaymentCommission = commissionableAmount * rate;
    const subsequentPaymentsCommission = subsequentPayments * rate;
    const totalCommission = firstPaymentCommission + subsequentPaymentsCommission;

    return { firstPaymentCommission, totalCommission };
  };
  
  return (
    <>
      <PageHeader title="Cuentas por Cobrar y Comisiones" />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente/Evento</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>1er Pago</TableHead>
                <TableHead>Comisión 1er Pago</TableHead>
                <TableHead>Comisión Total</TableHead>
                <TableHead className="text-center">Pagado al Vendedor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const salesperson = getSalesPerson(invoice.salespersonId);
                const { firstPaymentCommission, totalCommission } = calculateCommissions(invoice);

                return (
                    <TableRow key={invoice.id}>
                    <TableCell>
                        <div className="font-medium">{invoice.clientName}</div>
                        <div className="text-sm text-muted-foreground">
                            {invoice.eventType || 'No especificado'} - <ClientDate value={invoice.issueDate} />
                        </div>
                    </TableCell>
                    <TableCell>{salesperson?.name || 'N/A'}</TableCell>
                    <TableCell><ClientNumber value={invoice.amount} /></TableCell>
                    <TableCell><ClientNumber value={invoice.firstPayment || 0} /></TableCell>
                    <TableCell><ClientNumber value={firstPaymentCommission} /></TableCell>
                    <TableCell className="font-semibold"><ClientNumber value={totalCommission} /></TableCell>
                    <TableCell className="text-center">
                        <Select defaultValue={invoice.commissionPaid ? "yes" : "no"}>
                            <SelectTrigger className="w-28">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Sí</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </TableCell>
                    </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
