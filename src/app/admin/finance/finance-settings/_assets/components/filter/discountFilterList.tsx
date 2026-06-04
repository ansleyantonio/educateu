/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import toast from "react-hot-toast";

interface FilterDiscountListProps {
  isOpenModal: boolean;
  setIsOpenModal: (data: any) => void;
  onApplyFilters?: (filters: { discountType?: string; paymentStatus?: string }) => void;
  onClearFilters?: () => void;
  currentFilters?: {
    discountType?: string;
    paymentStatus?: string;
  };
}

interface FilterFormValues {
  discountType?: string;
  paymentStatus?: string;
}

export function FilterDiscountList({
  isOpenModal,
  setIsOpenModal,
  onApplyFilters,
  onClearFilters,
  currentFilters,
}: FilterDiscountListProps) {
  const methods = useForm<FilterFormValues>({
    defaultValues: {
      discountType: currentFilters?.discountType || undefined,
      paymentStatus: currentFilters?.paymentStatus || undefined,
    },
  });

  // Update form values when current filters change
  useEffect(() => {
    methods.reset({
      discountType: currentFilters?.discountType || undefined,
      paymentStatus: currentFilters?.paymentStatus || undefined,
    });
  }, [currentFilters, methods]);

  const handleApplyFilters = () => {
    const formValues = methods.getValues();
    
    if (!formValues.paymentStatus && !formValues.discountType) {
      toast.error("Please select at least one filter before applying.");
      return;
    }

    const filters = {
      paymentStatus: formValues.paymentStatus,
      discountType: formValues.discountType,
    };

    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    
    toast.success("Filters applied successfully");
    setIsOpenModal(false);
  };

  const handleClear = () => {
    methods.reset({
      discountType: undefined,
      paymentStatus: undefined,
    });
    
    if (onClearFilters) {
      onClearFilters();
    }
    
    toast.success("Filters cleared");
    setIsOpenModal(false);
  };

  return (
    <Sheet
      open={isOpenModal}
      onOpenChange={(open) => {
        setIsOpenModal(open);
      }}
    >
      <SheetTrigger className="hidden" asChild></SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Discounts</SheetTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </SheetHeader>

        <FormProvider {...methods}>
          <div className="py-4 space-y-5">
            {/* Filter by Discount Type */}
            <CustomField.SelectField
              form={methods}
              name="discountType"
              labelName="Discount Type"
              optional={true}
              placeholder="Select Discount Type"
              options={[
                { label: "Percentage", value: "PERCENTAGE" },
                { label: "Fixed Amount", value: "FIXED_AMOUNT" },
              ]}
            />

            {/* Filter by Payment Status */}
            <CustomField.SelectField
              form={methods}
              name="paymentStatus"
              labelName="Payment Status"
              optional={true}
              placeholder="Select Payment Status"
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
                { label: "Pending", value: "PENDING" },
              ]}
            />
          </div>

          <SheetFooter>
            <Button 
              onClick={handleClear} 
              variant="outline" 
              className="mr-2"
              type="button"
            >
              Clear
            </Button>
            <Button type="button" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </SheetFooter>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}