import { useForm } from "react-hook-form";
export function Example() {
  const { register, watch, formState } = useForm();
  register("users.0.age", { valueAsNumber: true });
  return [watch("users"), formState.isSubmitting];
}
