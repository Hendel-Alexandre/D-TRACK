import { useState, useRef } from 'react'
import { Upload, File, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/external-client'
import { useAuth } from '@/contexts/AuthContext'

interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFileUpload: (file: File, url: string) => void
}

export function FileUploadDialog({ open, onOpenChange, onFileUpload }: FileUploadDialogProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB in bytes
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 100MB.',
        variant: 'destructive'
      })
      return
    }

    setSelectedFile(file)
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create unique file path
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user?.id}/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('message-files')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('message-files')
        .getPublicUrl(filePath)

      setUploadProgress(100)
      onFileUpload(selectedFile, urlData.publicUrl)
      
      toast({
        title: 'File uploaded successfully',
        description: `${selectedFile.name} has been uploaded.`
      })

      // Reset state
      setSelectedFile(null)
      setUploadProgress(0)
      setIsUploading(false)
      onOpenChange(false)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file. Please try again.',
        variant: 'destructive'
      })
      setIsUploading(false)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      // Check file size
      const maxSize = 100 * 1024 * 1024
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 100MB.',
          variant: 'destructive'
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const resetDialog = () => {
    setSelectedFile(null)
    setUploadProgress(0)
    setIsUploading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) resetDialog()
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedFile ? (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 100MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept="*/*"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <File className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={uploadFile}
                  disabled={isUploading}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {isUploading ? (
                    'Uploading...'
                  ) : uploadProgress === 100 ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Uploaded
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}