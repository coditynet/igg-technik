import * as React from "react"
import {
  Shield,
  User,
  X,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ProfileFrame } from "@/app/(app)/account/_components/profile-frame"
import { PasskeyFrame } from "@/app/(app)/account/_components/passkey-frame"
import { SessionsFrame } from "@/app/(app)/account/_components/sessions-frame"
import { authClient } from "@/lib/auth-client"

const navItems = [
  { name: "General", icon: User, id: "general" },
  { name: "Security", icon: Shield, id: "security" },
]

interface AccountDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function AccountDialog({
  open,
  onOpenChange,
  children
}: AccountDialogProps) {
  const [activeTab, setActiveTab] = React.useState("general")
  const { data: session } = authClient.useSession()

  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const show = isControlled ? open : internalOpen
  const setShow = isControlled ? onOpenChange : setInternalOpen

  if (!session) return null

  return (
    <Dialog open={show} onOpenChange={setShow}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="overflow-hidden p-0 w-full md:max-h-[850px] md:max-w-[900px] lg:max-w-[1100px]" showCloseButton={false}>
        <DialogTitle className="sr-only">Account Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Manage your account settings and preferences.
        </DialogDescription>
        <SidebarProvider className="items-start min-h-0">
          <Sidebar collapsible="none" className="hidden md:flex w-60 border-r">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Account</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={activeTab === item.id}
                          onClick={() => setActiveTab(item.id)}
                        >
                          <item.icon />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setShow(false)}>
                    <X />
                    <span>Close</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <main className="flex h-[90vh] md:h-[750px] flex-1 flex-col overflow-hidden bg-muted/30">
            <div className="flex md:hidden items-center justify-between border-b bg-background p-4">
               <div className="flex gap-2">
                 {navItems.map((item) => (
                   <Button
                     key={item.id}
                     variant={activeTab === item.id ? "secondary" : "ghost"}
                     size="sm"
                     onClick={() => setActiveTab(item.id)}
                     className="gap-2"
                   >
                     <item.icon className="size-4" />
                     {item.name}
                   </Button>
                 ))}
               </div>
               <Button variant="ghost" size="icon" onClick={() => setShow(false)}>
                 <X className="size-4" />
                 <span className="sr-only">Close</span>
               </Button>
            </div>
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
              {activeTab === "general" && (
                 <ProfileFrame user={session.user} />
              )}
              {activeTab === "security" && (
                <div className="flex flex-col gap-6">
                  <PasskeyFrame />
                  <SessionsFrame currentSessionId={session.session.id} />
                </div>
              )}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
