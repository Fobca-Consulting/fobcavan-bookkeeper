
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Sample data (in a real app, this would come from an API)
const categories = [
  { id: 1, name: "Revenue" },
  { id: 2, name: "Expense" },
  { id: 3, name: "Investments" },
  { id: 4, name: "Utilities" },
  { id: 5, name: "Rent" },
  { id: 6, name: "Salaries" },
  { id: 7, name: "Software" },
  { id: 8, name: "Office Supplies" },
];

const accounts = [
  { id: 1, name: "Sales" },
  { id: 2, name: "Operating Expenses" },
  { id: 3, name: "Accounts Receivable" },
  { id: 4, name: "Utilities" },
  { id: 5, name: "Rent" },
  { id: 6, name: "Software" },
  { id: 7, name: "Bank Account" },
  { id: 8, name: "Cash" },
];

// Define the schema for form validation
const transactionFormSchema = z.object({
  date: z.date({
    required_error: "Transaction date is required",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters",
  }),
  category: z.string({
    required_error: "Please select a category",
  }),
  account: z.string({
    required_error: "Please select an account",
  }),
  reference: z.string().min(1, {
    message: "Reference is required",
  }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) !== 0, {
    message: "Amount must be a valid non-zero number",
  }),
  details: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: any; // For editing, pass the transaction data
  onSave: (data: TransactionFormValues, images: File[]) => void;
  dialogTitle: string;
  dialogDescription: string;
  submitButtonText: string;
}

export function TransactionForm({
  open,
  onOpenChange,
  transaction,
  onSave,
  dialogTitle,
  dialogDescription,
  submitButtonText,
}: TransactionFormProps) {
  const [images, setImages] = useState<File[]>([]);

  // Initialize form with default values or transaction data for editing
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: transaction
      ? {
          date: new Date(transaction.date),
          description: transaction.description,
          category: transaction.category,
          account: transaction.account,
          reference: transaction.reference,
          amount: String(Math.abs(transaction.amount)),
          details: transaction.details || "",
        }
      : {
          date: new Date(),
          description: "",
          category: "",
          account: "",
          reference: "",
          amount: "",
          details: "",
        },
  });

  function onSubmit(data: TransactionFormValues) {
    try {
      onSave(data, images);
      form.reset();
      setImages([]);
      onOpenChange(false);
      toast({
        title: "Success",
        description: transaction
          ? "Transaction updated successfully"
          : "Transaction created successfully",
      });
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your transaction",
        variant: "destructive",
      });
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.name}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.name}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reference" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>More Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about this transaction..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <div className="space-y-2">
              <FormLabel>Attachments (Optional)</FormLabel>
              <div className="border border-input rounded-md p-4">
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {images.map((file, index) => (
                      <div
                        key={index}
                        className="relative bg-slate-100 rounded-md p-2 flex items-center"
                      >
                        <span className="text-xs truncate flex-1">
                          {file.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 absolute right-1"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">
                <CheckCircle className="mr-2 h-4 w-4" />
                {submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
