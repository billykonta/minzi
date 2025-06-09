import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from '@/types/database';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const ALLOWED_FILE_TYPES = {
  'image/jpeg': { maxSize: 5 * 1024 * 1024, extension: 'jpg' },
  'image/png': { maxSize: 5 * 1024 * 1024, extension: 'png' },
  'image/gif': { maxSize: 5 * 1024 * 1024, extension: 'gif' },
  'application/pdf': { maxSize: 10 * 1024 * 1024, extension: 'pdf' },
  'text/plain': { maxSize: 2 * 1024 * 1024, extension: 'txt' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    maxSize: 10 * 1024 * 1024, 
    extension: 'docx' 
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { 
    maxSize: 10 * 1024 * 1024, 
    extension: 'xlsx' 
  }
};

export const isFileTypeAllowed = (file: File): boolean => {
  return Object.keys(ALLOWED_FILE_TYPES).includes(file.type);
};

export const isFileSizeAllowed = (file: File): boolean => {
  const fileType = file.type as keyof typeof ALLOWED_FILE_TYPES;
  if (!ALLOWED_FILE_TYPES[fileType]) return false;
  return file.size <= ALLOWED_FILE_TYPES[fileType].maxSize;
};

export const getFileExtension = (file: File): string => {
  const fileType = file.type as keyof typeof ALLOWED_FILE_TYPES;
  return ALLOWED_FILE_TYPES[fileType]?.extension || '';
};

export const createFilePreview = async (file: File): Promise<string> => {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }
  
  // For non-image files, return an icon based on file type
  if (file.type === 'application/pdf') {
    return '/icons/pdf.svg';
  } else if (file.type.includes('spreadsheet')) {
    return '/icons/excel.svg';
  } else if (file.type.includes('wordprocessing')) {
    return '/icons/word.svg';
  } else {
    return '/icons/file.svg';
  }
};

export const uploadFile = async (
  file: File, 
  userId: string
): Promise<{ path: string; error: Error | null }> => {
  try {
    const fileId = uuidv4();
    const extension = getFileExtension(file);
    const filePath = `${userId}/${fileId}.${extension}`;
    
    const { error } = await supabase.storage
      .from('chat_attachments')
      .upload(filePath, file);
    
    if (error) throw error;
    
    return { path: filePath, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { path: '', error: error as Error };
  }
};

export const getFileUrl = async (filePath: string): Promise<string> => {
  const { data } = await supabase.storage
    .from('chat_attachments')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!isFileTypeAllowed(file)) {
    return { 
      valid: false, 
      error: `File type not allowed. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}` 
    };
  }
  
  if (!isFileSizeAllowed(file)) {
    const fileType = file.type as keyof typeof ALLOWED_FILE_TYPES;
    const maxSizeMB = ALLOWED_FILE_TYPES[fileType].maxSize / (1024 * 1024);
    return { 
      valid: false, 
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB` 
    };
  }
  
  return { valid: true };
};
