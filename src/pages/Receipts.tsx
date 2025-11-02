import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/external-client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Receipt, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ReceiptData {
  id: string;
  receipt_date: string;
  vendor: string | null;
  amount: number;
  category: string | null;
  payment_method: string | null;
  description: string | null;
  file_url: string | null;
  created_at: string;
}

export default function Receipts() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReceipts();
    }
  }, [user]);

  const fetchReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('receipt_date', { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading receipts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Receipts</h1>
          <p className="text-muted-foreground mt-1">
            Track expenses with OCR-powered receipt scanning
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Receipt
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {receipts.map((receipt) => (
          <Card key={receipt.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-green-500" />
              </div>
              {receipt.category && (
                <Badge variant="secondary">{receipt.category}</Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{receipt.vendor || 'Unknown Vendor'}</h3>
                <span className="text-xl font-bold text-primary">
                  ${receipt.amount.toFixed(2)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                {format(new Date(receipt.receipt_date), 'MMM dd, yyyy')}
              </p>

              {receipt.payment_method && (
                <p className="text-xs text-muted-foreground">
                  via {receipt.payment_method}
                </p>
              )}

              {receipt.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {receipt.description}
                </p>
              )}
            </div>

            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Card>
        ))}

        {receipts.length === 0 && (
          <Card className="p-12 col-span-full text-center">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No receipts yet. Upload your first receipt to get started.
            </p>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Receipt
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
