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
import { useEffect, useState } from "react";
import { toast } from "sonner";
const formSchema = z.object({
  openAiKey: z.string(),
  anthropicKey: z.string(),
});

export function SettingsModelsContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const openaiKey = await window.electron.apiKeys.get("openai");
        const anthropicKey = await window.electron.apiKeys.get("anthropic");
        form.setValue("openAiKey", openaiKey || "");
        form.setValue("anthropicKey", anthropicKey || "");
      } catch (error) {
        console.error("Error fetching API keys:", error);
      } finally {
        setIsInitialLoad(false);
      }
    };
    fetchApiKeys();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openAiKey: "",
      anthropicKey: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Save the keys (e.g., to local storage or a secure store)
    setIsLoading(true);
    await window.electron.apiKeys.set("openai", values.openAiKey);
    await window.electron.apiKeys.set("anthropic", values.anthropicKey);

    // Add a small delay to show the success toast
    setTimeout(() => {
      setIsLoading(false);
      toast.success("API keys saved");
    }, 1000);
  };

  if (isInitialLoad) {
    return <div>Loading...</div>;
  }

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
          <Button type="submit" form="models-form" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </>
  );
}
