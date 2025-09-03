import { Link, useLocation } from "wouter";
import { 
  DollarSign, 
  Package, 
  Clock, 
  AlertTriangle, 
  Microscope,
  BarChart3,
  ChartLine,
  Settings,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: ChartLine },
  { name: "Price Evaluation", href: "/price-evaluation", icon: DollarSign },
  { name: "Quantity Evaluation", href: "/quantity-evaluation", icon: Package },
  { name: "Delivery Time", href: "/delivery-evaluation", icon: Clock },
  { name: "Quality Notifications", href: "/quality-evaluation", icon: AlertTriangle },
  { name: "PPM Evaluation", href: "/ppm-evaluation", icon: Microscope },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ChartLine className="text-primary-foreground w-4 h-4" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Supplier KPI</h1>
            <p className="text-sm text-muted-foreground">Evaluation System</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4" data-testid="nav-menu">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <a 
                    className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${
                      isActive 
                        ? 'bg-accent text-accent-foreground' 
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="text-muted-foreground w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">Procurement Manager</p>
          </div>
          <button 
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
