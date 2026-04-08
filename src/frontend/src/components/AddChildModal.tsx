import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useBackend } from "../hooks/useBackend";

interface AddChildModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormState {
  name: string;
  age: string;
  deviceId: string;
}

const INITIAL: FormState = { name: "", age: "", deviceId: "" };

interface FieldErrors {
  name?: string;
  age?: string;
  deviceId?: string;
}

export function AddChildModal({ open, onOpenChange }: AddChildModalProps) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = "Child name is required.";
    const age = Number.parseInt(form.age, 10);
    if (!form.age || Number.isNaN(age) || age < 0 || age > 17) {
      next.age = "Enter a valid age between 0 and 17.";
    }
    if (!form.deviceId.trim()) next.deviceId = "Device ID is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !actor) return;

    setSubmitting(true);
    try {
      await actor.createChild(
        form.name.trim(),
        BigInt(Number.parseInt(form.age, 10)),
        form.deviceId.trim(),
      );
      toast.success(`${form.name.trim()} added successfully!`);
      queryClient.invalidateQueries({ queryKey: ["myChildren"] });
      setForm(INITIAL);
      setErrors({});
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to add child. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    setForm(INITIAL);
    setErrors({});
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md bg-card border border-border shadow-elevated"
        data-ocid="add-child-modal"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <UserPlus className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <DialogTitle className="font-display text-lg text-foreground">
              Add Child
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Register a child profile to begin monitoring their health data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2" noValidate>
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Child Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Amara"
              value={form.name}
              onChange={handleChange}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              className="bg-background border-input"
              data-ocid="add-child-name-input"
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-destructive mt-1">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="age"
              className="text-sm font-medium text-foreground"
            >
              Age (years)
            </Label>
            <Input
              id="age"
              name="age"
              type="number"
              min={0}
              max={17}
              placeholder="e.g. 5"
              value={form.age}
              onChange={handleChange}
              aria-invalid={!!errors.age}
              aria-describedby={errors.age ? "age-error" : undefined}
              className="bg-background border-input"
              data-ocid="add-child-age-input"
            />
            {errors.age && (
              <p id="age-error" className="text-xs text-destructive mt-1">
                {errors.age}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="deviceId"
              className="text-sm font-medium text-foreground"
            >
              Device ID
            </Label>
            <Input
              id="deviceId"
              name="deviceId"
              placeholder="e.g. ESP32-A1B2C3"
              value={form.deviceId}
              onChange={handleChange}
              aria-invalid={!!errors.deviceId}
              aria-describedby={errors.deviceId ? "deviceId-error" : undefined}
              className="bg-background border-input font-mono text-sm"
              data-ocid="add-child-deviceid-input"
            />
            {errors.deviceId && (
              <p id="deviceId-error" className="text-xs text-destructive mt-1">
                {errors.deviceId}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              data-ocid="add-child-cancel-btn"
            >
              <X className="h-4 w-4 mr-1" aria-hidden="true" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !actor}
              data-ocid="add-child-submit-btn"
            >
              {submitting ? (
                <>
                  <Loader2
                    className="h-4 w-4 mr-1.5 animate-spin"
                    aria-hidden="true"
                  />
                  Adding…
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Add Child
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
