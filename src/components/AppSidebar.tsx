
import { Link, useLocation } from "react-router-dom";
import {
  ChartPie,
  CreditCard,
  FileText,
  Home,
  Settings,
  Menu,
  DollarSign,
  BookOpen,
  BarChart,
  Wallet,
  ChevronRight,
  Receipt
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: Home,
  },
  {
    title: "Transactions",
    path: "/transactions",
    icon: CreditCard,
  },
  {
    title: "Accounts",
    path: "/accounts",
    icon: BookOpen,
  },
  {
    title: "Invoices & Receipts",
    path: "/invoices",
    icon: Receipt,
  },
  {
    title: "Reports",
    path: "/reports",
    icon: FileText,
    submenu: [
      { title: "Income Statement", path: "/reports?type=income" },
      { title: "Balance Sheet", path: "/reports?type=balance" },
      { title: "Cash Flow", path: "/reports?type=cashflow" },
      { title: "Accounts Receivable", path: "/reports?type=ar" },
      { title: "Accounts Payable", path: "/reports?type=ap" },
      { title: "Inventory", path: "/reports?type=inventory" },
      { title: "Sales", path: "/reports?type=sales" },
      { title: "Expenses", path: "/reports?type=expenses" },
    ]
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar>
      <SidebarHeader className="flex justify-between items-center px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <Wallet size={24} className="text-primary" />
          <span className="font-bold text-lg text-white">FobcaBookkeeper</span>
        </div>
        <SidebarTrigger>
          <Menu size={18} />
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.submenu ? (
                    <div className="w-full">
                      <details className="group">
                        <summary className="flex cursor-pointer items-center justify-between px-2 py-2 hover:bg-sidebar-accent rounded-md">
                          <div className="flex items-center gap-3">
                            <item.icon size={18} />
                            <span>{item.title}</span>
                          </div>
                          <ChevronRight size={16} className="transition-transform group-open:rotate-90" />
                        </summary>
                        <ul className="mt-1 space-y-1 pl-8">
                          {item.submenu.map((subitem) => (
                            <li key={subitem.title}>
                              <Link
                                to={subitem.path}
                                className="block rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent"
                              >
                                {subitem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  ) : (
                    <SidebarMenuButton
                      className={cn(
                        currentPath === item.path ? "bg-sidebar-accent" : ""
                      )}
                    >
                      <Link to={item.path} className="flex items-center gap-3 w-full">
                        <item.icon size={18} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4 py-3 text-xs text-gray-400">
        FobcaBookkeeper v1.0.0
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
