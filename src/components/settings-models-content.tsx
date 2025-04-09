import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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

const formSchema = z.object({
  openAiKey: z.string().min(1, "OpenAI API key is required"),
  anthropicKey: z.string().min(1, "Anthropic API key is required"),
});

export function SettingsModelsContent() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openAiKey: "",
      anthropicKey: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Save the keys (e.g., to local storage or a secure store)
  };

  return (
    <>
      <Form {...form}>
        <form
          id="models-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="openAiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OpenAI API Key</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your OpenAI API Key"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="anthropicKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anthropic API Key</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your Anthropic API Key"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" form="models-form">
            Save
          </Button>
        </form>
      </Form>
    </>
  );
}
