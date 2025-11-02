import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/external-client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Quote {
  id: string;
  quote_number: string;
  status: string;
  issue_date: string;
  expiry_date: string | null;
  total: number;
  client_id: string | null;
  clients: { name: string } | null;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  sent: 'bg-blue-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
  expired: 'bg-gray-400',
};

export default function Quotes() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchQuotes();
    }
  }, [user]);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          clients (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading quotes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotes</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage client quotes
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Quote
        </Button>
      </div>

      <div className="grid gap-4">
        {quotes.map((quote) => (
          <Card key={quote.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{quote.quote_number}</h3>
                    <Badge className={statusColors[quote.status]}>
                      {quote.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quote.clients?.name || 'No client'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ${quote.total.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expires {quote.expiry_date ? format(new Date(quote.expiry_date), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>

                <div className="flex gap-2">
                  {quote.status === 'accepted' && (
                    <Button variant="default" size="sm">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Convert to Invoice
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {quotes.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No quotes yet. Create your first quote to get started.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
