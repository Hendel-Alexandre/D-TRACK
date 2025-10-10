import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileImage, Download, AlertCircle, CheckCircle, Loader2, Search, Filter, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CallRecord {
  id: string;
  employee: string;
  callTime: string;
  duration: string;
  status: string;
  phoneNumber: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

export default function OCRCallReport() {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<CallRecord[]>([]);
  const [filterEmployee, setFilterEmployee] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a valid image file (JPG, PNG)',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      toast({
        title: 'Image Uploaded',
        description: 'Image ready for processing',
      });
    };
    reader.readAsDataURL(file);
  };

  const processOCR = async () => {
    if (!uploadedImage) {
      toast({
        title: 'No Image',
        description: 'Please upload an image first',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate OCR processing
    setTimeout(() => {
      // Mock data - in real implementation, this would come from OCR service
      const mockData: CallRecord[] = [
        {
          id: '1',
          employee: 'John Doe',
          callTime: '2025-01-15 09:30:00',
          duration: '320',
          status: 'Completed',
          phoneNumber: '+1-555-0123'
        },
        {
          id: '2',
          employee: 'Jane Smith',
          callTime: '2025-01-15 10:15:00',
          duration: '180',
          status: 'Completed',
          phoneNumber: '+1-555-0124'
        },
        {
          id: '3',
          employee: 'Bob Johnson',
          callTime: '2025-01-15 11:00:00',
          duration: '420',
          status: 'Missed',
          phoneNumber: '+1-555-0125'
        },
        {
          id: '4',
          employee: 'Alice Williams',
          callTime: '2025-01-15 13:45:00',
          duration: '240',
          status: 'Completed',
          phoneNumber: '+1-555-0126'
        },
      ];

      setParsedData(mockData);
      setIsProcessing(false);
      toast({
        title: 'OCR Complete',
        description: `Successfully extracted ${mockData.length} call records`,
      });
    }, 3000);
  };

  const downloadCSV = () => {
    if (parsedData.length === 0) return;

    const headers = ['Employee', 'Call Time', 'Duration (seconds)', 'Status', 'Phone Number'];
    const csv = [
      headers.join(','),
      ...parsedData.map(record => 
        [record.employee, record.callTime, record.duration, record.status, record.phoneNumber].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'CSV Downloaded',
      description: 'Call report exported successfully',
    });
  };

  const filteredData = parsedData.filter(record => {
    const matchesEmployee = filterEmployee === 'all' || record.employee === filterEmployee;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      record.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.phoneNumber.includes(searchQuery);
    return matchesEmployee && matchesStatus && matchesSearch;
  });

  const uniqueEmployees = Array.from(new Set(parsedData.map(r => r.employee)));
  const uniqueStatuses = Array.from(new Set(parsedData.map(r => r.status)));

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient">OCR Call Report Import</h1>
            <p className="text-muted-foreground mt-2">Upload and extract call report data from images</p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <FileImage className="h-4 w-4 mr-2" />
            Work Mode
          </Badge>
        </div>
      </motion.div>

      {/* Upload Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Call Report Image
            </CardTitle>
            <CardDescription>
              Upload a JPG or PNG image of your call report table. Our OCR will extract the data automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileImage className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Click to upload image</p>
                    <p className="text-sm text-muted-foreground">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground">PNG or JPG (Max 10MB)</p>
                </div>
              </label>
            </div>

            {uploadedImage && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={uploadedImage} alt="Uploaded" className="w-full h-auto max-h-96 object-contain" />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setUploadedImage(null);
                      setParsedData([]);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={processOCR} 
                    disabled={isProcessing}
                    className="flex-1 gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing OCR...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Extract Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary">Best Results Tips:</p>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• Ensure image is clear and well-lit</li>
                  <li>• Table should be fully visible without cuts</li>
                  <li>• Avoid skewed or angled photos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Section */}
      {parsedData.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Extracted Call Records</CardTitle>
                  <CardDescription>{filteredData.length} records found</CardDescription>
                </div>
                <Button onClick={downloadCSV} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by employee or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {uniqueEmployees.map(emp => (
                      <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {uniqueStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Call Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Phone Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employee}</TableCell>
                        <TableCell>{record.callTime}</TableCell>
                        <TableCell>{Math.floor(parseInt(record.duration) / 60)}m {parseInt(record.duration) % 60}s</TableCell>
                        <TableCell>
                          <Badge variant={record.status === 'Completed' ? 'default' : 'destructive'}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{record.phoneNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
