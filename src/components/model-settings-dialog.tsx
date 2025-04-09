import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useEffect, useState } from "react";

const formSchema = z.object({
  openAiKey: z.string().min(1, "OpenAI API key is required"),
  anthropicKey: z.string().min(1, "Anthropic API key is required"),
});

const ModelSettingsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.electron.ipcRenderer.on("open-model-settings", () => {
      console.log("Open model settings event received");
      setIsOpen(true);
    });

    return () => {
      window.electron.ipcRenderer.removeListener(
        "open-model-settings",
        () => {}
      );
    };
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openAiKey: "",
      anthropicKey: "",
    },
  });

  const onClose = () => {};

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Save the keys (e.g., to local storage or a secure store)
    // onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter API Keys</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSettingsDialog;
