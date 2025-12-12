import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, AlertCircle, FileText, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import FileUploader from '@/components/study/FileUploader';
import DocumentCard from '@/components/study/DocumentCard';
import EmptyState from '@/components/study/EmptyState';

export default function UploadNotes() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date'),
  });

  const createDocumentMutation = useMutation({
    mutationFn: (data) => base44.entities.Document.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Document.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted');
    },
  });

  const getFileType = (file) => {
    if (file.type.includes('pdf')) return 'pdf';
    if (file.type.includes('image')) return 'image';
    return 'doc';
  };

  const handleFileSelect = async (file) => {
    setIsProcessing(true);
    setUploadSuccess(false);
    
    try {
      // Step 1: Upload file
      setProcessingStatus('Uploading file...');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Step 2: Create document record
      setProcessingStatus('Creating document...');
      const doc = await createDocumentMutation.mutateAsync({
        title: file.name,
        original_file_url: file_url,
        file_type: getFileType(file),
        status: 'processing'
      });

      // Step 3: Extract text using AI
      setProcessingStatus('Extracting text with AI...');
      const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            extracted_text: {
              type: "string",
              description: "All text content extracted from the document"
            }
          }
        }
      });

      let extractedText = '';
      if (extractionResult.status === 'success' && extractionResult.output) {
        extractedText = extractionResult.output.extracted_text || '';
      }

      // If extraction failed or no text, try with LLM
      if (!extractedText) {
        setProcessingStatus('Processing with AI vision...');
        const llmResult = await base44.integrations.Core.InvokeLLM({
          prompt: "Extract all text content from this document. Return only the extracted text, no explanations.",
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              text: { type: "string", description: "All extracted text from the document" }
            }
          }
        });
        extractedText = llmResult.text || '';
      }

      // Step 4: Update document with extracted text
      setProcessingStatus('Saving processed content...');
      await updateDocumentMutation.mutateAsync({
        id: doc.id,
        data: {
          extracted_text: extractedText,
          status: extractedText ? 'completed' : 'failed'
        }
      });

      setUploadSuccess(true);
      toast.success('Document processed successfully!');

    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process document');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Notes</h1>
            <p className="text-gray-500 text-sm">Upload your study materials to get started</p>
          </div>
        </div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <FileUploader
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
            processingStatus={processingStatus}
          />

          <AnimatePresence>
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Document processed successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Documents List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Documents</h2>
          
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents yet"
              description="Upload your first document to get started with AI-powered studying"
            />
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}