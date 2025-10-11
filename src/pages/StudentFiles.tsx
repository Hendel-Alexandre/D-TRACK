import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Upload, File, Trash2, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface FileData {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  tags: string[] | null;
  created_at: string;
}

export default function StudentFiles() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user]);

  const loadFiles = async () => {
    const { data, error } = await supabase
      .from('student_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile) return;

    setUploading(true);

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('student-uploads')
      .upload(fileName, selectedFile);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error('Failed to upload file');
      setUploading(false);
      return;
    }

    // Save metadata
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
    const { error: dbError } = await supabase
      .from('student_files')
      .insert({
        user_id: user.id,
        file_name: selectedFile.name,
        file_path: fileName,
        file_type: selectedFile.type || null,
        file_size: selectedFile.size,
        tags: tagArray.length > 0 ? tagArray : null,
      });

    if (dbError) {
      console.error('Error saving file metadata:', dbError);
      toast.error('Failed to save file metadata');
    } else {
      toast.success('File uploaded successfully!');
      setDialogOpen(false);
      resetForm();
      loadFiles();
    }

    setUploading(false);
  };

  const handleDelete = async (file: FileData) => {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('student-uploads')
      .remove([file.file_path]);

    if (storageError) {
      console.error('Error deleting file:', storageError);
      toast.error('Failed to delete file');
      return;
    }

    // Delete metadata
    const { error: dbError } = await supabase
      .from('student_files')
      .delete()
      .eq('id', file.id);

    if (dbError) {
      console.error('Error deleting metadata:', dbError);
      toast.error('Failed to delete metadata');
    } else {
      toast.success('File deleted');
      loadFiles();
    }
  };

  const handleDownload = async (file: FileData) => {
    const { data, error } = await supabase.storage
      .from('student-uploads')
      .download(file.file_path);

    if (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTags('');
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="h-8 w-8 text-muted-foreground" />;
    if (fileType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-primary" />;
    return <FileText className="h-8 w-8 text-primary" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return <div className="p-6">Loading files...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Files</h1>
          <p className="text-muted-foreground">Upload and manage your study materials</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New File</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select File *</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="notes, math, homework"
                />
              </div>
              <Button type="submit" className="w-full" disabled={uploading || !selectedFile}>
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {files.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No files uploaded yet</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-border/50 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    {getFileIcon(file.file_type)}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(file)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <h4 className="font-semibold text-sm truncate" title={file.file_name}>
                    {file.file_name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file_size)} • {format(new Date(file.created_at), 'PP')}
                  </p>
                  {file.tags && file.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {file.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
