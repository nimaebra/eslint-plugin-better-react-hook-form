import { useForm } from "react-hook-form";
export function Example() {
  const { register } = useForm();
  register("age", { valueAsNumber: true, valueAsDate: true });
}
