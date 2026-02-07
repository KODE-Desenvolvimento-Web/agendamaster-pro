import { 
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/StatCard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 12500 },
  { month: 'Feb', revenue: 15200 },
  { month: 'Mar', revenue: 14800 },
  { month: 'Apr', revenue: 18900 },
  { month: 'May', revenue: 21000 },
  { month: 'Jun', revenue: 19500 },
];

const serviceBreakdown = [
  { name: 'Hair Services', value: 45, color: 'bg-primary' },
  { name: 'Nail Services', value: 25, color: 'bg-pink-500' },
  { name: 'Beard & Grooming', value: 20, color: 'bg-blue-500' },
  { name: 'Spa & Wellness', value: 10, color: 'bg-green-500' },
];

const topServices = [
  { name: 'Haircut + Blowdry', bookings: 145, revenue: 21750 },
  { name: 'Men\'s Haircut', bookings: 98, revenue: 5880 },
  { name: 'Hair Coloring', bookings: 67, revenue: 18760 },
  { name: 'Manicure + Pedicure', bookings: 89, revenue: 7120 },
  { name: 'Beard Trim', bookings: 76, revenue: 3800 },
];

export default function ReportsPage() {
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="mt-1 text-muted-foreground">
              Analyze your business performance
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select defaultValue="30">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value="R$ 102.400"
            change={12.5}
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Total Bookings"
            value="475"
            change={8.2}
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatCard
            title="New Customers"
            value="48"
            change={15.3}
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            title="Avg. Ticket"
            value="R$ 215"
            change={-2.1}
            icon={<TrendingUp className="h-6 w-6" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Revenue Overview
                  </CardTitle>
                  <CardDescription>Monthly revenue for the last 6 months</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end justify-between gap-2">
                {revenueData.map((data) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-primary rounded-t-lg transition-all hover:opacity-80"
                      style={{ 
                        height: `${(data.revenue / maxRevenue) * 250}px`,
                        minHeight: '20px'
                      }}
                    />
                    <div className="text-center">
                      <p className="text-xs font-medium text-muted-foreground">{data.month}</p>
                      <p className="text-sm font-bold">
                        R$ {(data.revenue / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Service Breakdown
              </CardTitle>
              <CardDescription>Revenue by service category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceBreakdown.map((service) => (
                  <div key={service.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-3 w-3 rounded-full", service.color)} />
                        <span>{service.name}</span>
                      </div>
                      <span className="font-medium">{service.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all", service.color)}
                        style={{ width: `${service.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Services Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Services</CardTitle>
            <CardDescription>Services ranked by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div 
                  key={service.name}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth"
                >
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                    index === 0 && "bg-yellow-500/20 text-yellow-600",
                    index === 1 && "bg-gray-400/20 text-gray-500",
                    index === 2 && "bg-amber-600/20 text-amber-700",
                    index > 2 && "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.bookings} bookings
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">
                      R$ {service.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      R$ {Math.round(service.revenue / service.bookings)} avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
