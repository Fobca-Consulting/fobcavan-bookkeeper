
import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Edit, File, Trash } from "lucide-react";

interface TransactionDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionDetails({
  open,
  onOpenChange,
  transaction,
  onEdit,
  onDelete,
}: TransactionDetailsProps) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>View the complete transaction information.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
              <p className="font-medium">{format(new Date(transaction.date), "PPP")}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1 bg-green-100 text-green-800">
                {transaction.status}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
            <p className="font-medium">{transaction.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
              <p className="font-medium">{transaction.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Account</h3>
              <p className="font-medium">{transaction.account}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Reference</h3>
              <p className="font-medium">{transaction.reference}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
              <p className={`font-medium ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          {transaction.details && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Additional Details</h3>
              <p className="text-sm">{transaction.details}</p>
            </div>
          )}

          {/* Placeholder for attachments */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Attachments</h3>
            <div className="flex flex-wrap gap-2">
              {transaction.attachments && transaction.attachments.length > 0 ? (
                transaction.attachments.map((file: string, index: number) => (
                  <div key={index} className="flex items-center rounded bg-slate-100 px-2 py-1">
                    <File className="h-3 w-3 mr-1" />
                    <span className="text-xs">{file}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No attachments</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="destructive" onClick={onDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
