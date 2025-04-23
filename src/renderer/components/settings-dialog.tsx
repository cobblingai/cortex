import * as React from "react";
import {
  Bell,
  Check,
  Globe,
  Home,
  Keyboard,
  Link,
  Lock,
  Menu,
  MessageCircle,
  Paintbrush,
  Settings,
  Video,
} from "lucide-react";

// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/renderer/components/ui/breadcrumb";
import { Button } from "@/renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/renderer/components/ui/sidebar";
import { SettingsModelsContent } from "./settings-models-content";
import { useEffect } from "react";

type NavItem = "Models";

const data: { nav: { name: NavItem; icon: React.ElementType }[] } = {
  nav: [
    // { name: "Notifications", icon: Bell },
    { name: "Models", icon: Settings },
    // { name: "Navigation", icon: Menu },
    // { name: "Home", icon: Home },
    // { name: "Appearance", icon: Paintbrush },
    // { name: "Messages & media", icon: MessageCircle },
    // { name: "Language & region", icon: Globe },
    // { name: "Accessibility", icon: Keyboard },
    // { name: "Mark as read", icon: Check },
    // { name: "Audio & video", icon: Video },
    // { name: "Connected accounts", icon: Link },
    // { name: "Privacy & visibility", icon: Lock },
    // { name: "Advanced", icon: Settings },
  ],
};

export function SettingsDialog() {
  const [open, setOpen] = React.useState(false);
  const [selectedNavItem, setSelectedNavItem] =
    React.useState<NavItem>("Models");

  useEffect(() => {
    window.electron.settings.open();

    return () => {
      window.electron.settings.removeListener(() => {});
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px] gap-2">
        <DialogTitle className="border-b px-6 py-4 text-xl font-semibold">
          Settings
        </DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex bg-background">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === "Models"}
                        >
                          <a href="#">
                            <item.icon />
                            <span>{item.name}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden py-4">
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              {selectedNavItem === "Models" && <SettingsModelsContent />}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
