type FormValues<Keys extends readonly string[]> = {
  [Key in Keys[number]]: string;
};

/** Превращает FormData в объект и сохраняет union имён полей без ручных cast на каждом поле. */
export function readFormValues<const Keys extends readonly string[]>(form: HTMLFormElement, keys: Keys): FormValues<Keys> {
  const data = new FormData(form);
  return Object.fromEntries(keys.map((key) => [key, String(data.get(key) ?? "")])) as FormValues<Keys>;
}
