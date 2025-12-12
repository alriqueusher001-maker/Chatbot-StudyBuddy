import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, BookOpen, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import QuestionInput from '@/components/study/QuestionInput';
import AnswerCard from '@/components/study/AnswerCard';
import EmptyState from '@/components/study/EmptyState';

export default function AskQuestion() {
  const [isAsking, setIsAsking] = useState(false);
  const [latestAnswer, setLatestAnswer] = useState(null);
  const queryClient = useQueryClient();

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.filter({ status: 'completed' }, '-created_date'),
  });

  const { data: recentQuestions = [] } = useQuery({
    queryKey: ['recent-questions'],
    queryFn: () => base44.entities.Question.list('-created_date', 5),
  });

  const createQuestionMutation = useMutation({
    mutationFn: (data) => base44.entities.Question.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-questions'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  const handleAskQuestion = async (questionText) => {
    if (documents.length === 0) {
      toast.error('Please upload some documents first');
      return;
    }

    setIsAsking(true);
    setLatestAnswer(null);

    try {
      // Build context from all documents
      const context = documents
        .filter(doc => doc.extracted_text)
        .map(doc => `[Document: ${doc.title}]\n${doc.extracted_text}`)
        .join('\n\n---\n\n');

      // Build RAG prompt
      const ragPrompt = `You are a helpful study assistant. Use the retrieved context below to answer the user's question accurately and helpfully. 
If the answer is not found in the provided material, clearly state that the information is not available in the uploaded documents.
Be concise but thorough. Use bullet points or numbered lists when appropriate for clarity.

CONTEXT FROM UPLOADED DOCUMENTS:
${context}

USER'S QUESTION:
${questionText}

Please provide a helpful, accurate answer based on the context above.`;

      // Get AI answer
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: ragPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { 
              type: "string", 
              description: "The complete answer to the user's question based on the provided context" 
            },
            confidence: {
              type: "string",
              enum: ["high", "medium", "low"],
              description: "How confident the answer is based on available information"
            }
          }
        }
      });

      const answer = response.answer || "I couldn't generate an answer. Please try again.";

      // Save question and answer
      await createQuestionMutation.mutateAsync({
        question_text: questionText,
        context_used: context.substring(0, 5000), // Limit context storage
        ai_answer: answer,
        document_ids: documents.map(d => d.id)
      });

      setLatestAnswer({
        question: questionText,
        answer: answer,
        context: context.substring(0, 2000)
      });

      toast.success('Answer generated!');

    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to generate answer');
    } finally {
      setIsAsking(false);
    }
  };

  const hasDocuments = documents.length > 0;

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
            <h1 className="text-2xl font-bold text-gray-900">Ask a Question</h1>
            <p className="text-gray-500 text-sm">Get AI-powered answers from your study materials</p>
          </div>
        </div>

        {/* Document Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            hasDocuments 
              ? 'bg-green-50 border border-green-100' 
              : 'bg-amber-50 border border-amber-100'
          }`}
        >
          {hasDocuments ? (
            <>
              <BookOpen className="w-5 h-5 text-green-600" />
              <span className="text-green-700 text-sm">
                <strong>{documents.length}</strong> document{documents.length !== 1 ? 's' : ''} ready for questions
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="text-amber-700 text-sm">
                No documents uploaded yet. 
                <Link to={createPageUrl('UploadNotes')} className="underline ml-1 font-medium">
                  Upload notes first
                </Link>
              </span>
            </>
          )}
        </motion.div>

        {/* Question Input */}
        <div className="mb-8">
          <QuestionInput
            onSubmit={handleAskQuestion}
            isLoading={isAsking}
            placeholder={hasDocuments 
              ? "Ask anything about your uploaded notes..." 
              : "Upload documents first to ask questions"}
          />
        </div>

        {/* Latest Answer */}
        {latestAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Answer</h2>
            <AnswerCard
              question={latestAnswer.question}
              answer={latestAnswer.answer}
              context={latestAnswer.context}
              isLatest={true}
            />
          </motion.div>
        )}

        {/* Recent Questions */}
        {recentQuestions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Questions</h2>
              <Link to={createPageUrl('History')}>
                <Button variant="ghost" size="sm" className="text-indigo-600">
                  View all
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentQuestions.slice(0, 3).map((q) => (
                <AnswerCard
                  key={q.id}
                  question={q.question_text}
                  answer={q.ai_answer}
                  context={q.context_used}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State for questions */}
        {recentQuestions.length === 0 && !latestAnswer && hasDocuments && (
          <EmptyState
            icon={FileText}
            title="No questions yet"
            description="Ask your first question about your study materials"
          />
        )}
      </div>
    </div>
  );
}