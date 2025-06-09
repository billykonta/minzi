import React, { useState } from 'react';
import { FileUpload as FileUploadType } from '@/types/database';
import { validateFile, createFilePreview } from '@/lib/file-upload';
import { Button } from '@/components/ui/button';
import { X, Image, FileText, FileArchive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: FileUploadType[]) => void;
  onFileRemove: (index: number) => void;
  selectedFiles: FileUploadType[];
  disabled?: boolean;
}

export function FileUpload({
  onFilesSelected,
  onFileRemove,
  selectedFiles,
  disabled = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(e.target.files);
      // Reset the input value so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const handleFiles = async (fileList: FileList) => {
    const newFiles: FileUploadType[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validation = validateFile(file);
      
      if (validation.valid) {
        const preview = await createFilePreview(file);
        newFiles.push({
          file,
          preview,
          uploading: false
        });
      } else {
        newFiles.push({
          file,
          preview: '/icons/error.svg',
          uploading: false,
          error: validation.error
        });
      }
    }
    
    onFilesSelected(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-5 w-5" />;
    } else {
      return <FileArchive className="h-5 w-5" />;
    }
  };

  return (
    <div className="w-full">
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedFiles.map((fileUpload, index) => (
            <div
              key={index}
              className={cn(
                "group relative flex items-center gap-2 rounded-md border bg-background p-2 text-sm",
                fileUpload.error && "border-destructive bg-destructive/10"
              )}
            >
              {fileUpload.file.type.startsWith('image/') ? (
                <div className="h-8 w-8 overflow-hidden rounded">
                  <img 
                    src={fileUpload.preview} 
                    alt={fileUpload.file.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                  {getFileIcon(fileUpload.file)}
                </div>
              )}
              <div className="flex flex-col">
                <span className="max-w-[150px] truncate font-medium">
                  {fileUpload.file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(fileUpload.file.size / 1024).toFixed(1)} KB
                </span>
                {fileUpload.error && (
                  <span className="text-xs text-destructive">{fileUpload.error}</span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-muted opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => onFileRemove(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "cursor-not-allowed opacity-60"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-medium">
            Drag files here or click to upload
          </p>
          <p className="text-xs text-muted-foreground">
            Support for images, PDFs, and documents up to 10MB
          </p>
        </div>
      </div>
    </div>
  );
}
