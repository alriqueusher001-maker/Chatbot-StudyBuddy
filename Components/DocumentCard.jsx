import React from 'react';
import { FileText, Image, File, Calendar, CheckCircle, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

export default function DocumentCard({ document, onDelete }) {
  const getFileIcon = () => {
    const type = document.file_type;
    if (type === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (type === 'image') return <Image className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getStatusBadge = () => {
    switch (document.status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" /> Ready
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            <Loader2 className="w-3 h-3 animate-spin" /> Processing
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-gray-50 rounded-xl">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{document.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(document.created_date), 'MMM d, yyyy')}
              </span>
              {getStatusBadge()}
            </div>
          </div>
        </div>
        
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(document.id)}
            className="text-gray-400 hover:text-red-500 h-8 w-8"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {document.extracted_text && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 line-clamp-3">
            {document.extracted_text.substring(0, 200)}...
          </p>
        </div>
      )}
    </motion.div>
  );
}