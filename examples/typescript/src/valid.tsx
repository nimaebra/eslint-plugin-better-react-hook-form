import { useFieldArray, useForm } from "react-hook-form";
export function Example() {
  const { control, register } = useForm<{ users: { name: string }[] }>();
  const { fields } = useFieldArray({ control, name: "users" });
  return fields.map((field, index) => (
    <input key={field.id} {...register(`users.${index}.name`)} />
  ));
}
