import { Controller, useForm } from "react-hook-form";
export function Example() {
  const { control } = useForm();
  return (
    <Controller
      control={control}
      name="name"
      defaultValue={undefined}
      render={({ field }) => <input {...field} />}
    />
  );
}
