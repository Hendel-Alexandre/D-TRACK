import { Card } from '@/components/ui/card';
import { Calculator, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function Tax() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tax Management</h1>
        <p className="text-muted-foreground mt-1">
          Automated tax tracking and quarterly summaries
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Q4 2024 Tax Due</span>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">$0.00</div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">YTD Income</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">$0.00</div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">YTD Expenses</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">$0.00</div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Next Deadline</span>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-xl font-bold">Jan 15, 2025</div>
        </Card>
      </div>

      <Card className="p-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Tax automation coming soon</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          LumenR will automatically calculate quarterly tax obligations based on your invoices and expenses.
        </p>
      </Card>
    </div>
  );
}
