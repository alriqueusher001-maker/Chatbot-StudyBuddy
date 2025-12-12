import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, History as HistoryIcon, Search, Trash2, Calendar, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import AnswerCard from '@/components/study/AnswerCard';
import EmptyState from '@/components/study/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function History() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['questions'],
    queryFn: () => base44.entities.Question.list('-created_date'),
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (id) => base44.entities.Question.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Question deleted');
    },
  });

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestionMutation.mutate(id);
    }
  };

  const filteredQuestions = questions
    .filter(q => 
      q.question_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.ai_answer?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.created_date) - new Date(a.created_date);
      }
      return new Date(a.created_date) - new Date(b.created_date);
    });

  // Group by date
  const groupedQuestions = filteredQuestions.reduce((groups, question) => {
    const date = format(new Date(question.created_date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(question);
    return groups;
  }, {});

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
            <h1 className="text-2xl font-bold text-gray-900">Question History</h1>
            <p className="text-gray-500 text-sm">Browse your previous questions and answers</p>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="pl-10 rounded-xl border-gray-200"
              />
            </div>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full sm:w-40 rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Stats */}
        {questions.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <HistoryIcon className="w-4 h-4" />
            <span>{questions.length} total question{questions.length !== 1 ? 's' : ''}</span>
            {searchQuery && (
              <span>• {filteredQuestions.length} matching</span>
            )}
          </div>
        )}

        {/* Questions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (
          searchQuery ? (
            <EmptyState
              icon={Search}
              title="No results found"
              description={`No questions matching "${searchQuery}"`}
              actionLabel="Clear search"
              onAction={() => setSearchQuery('')}
            />
          ) : (
            <EmptyState
              icon={HistoryIcon}
              title="No questions yet"
              description="Start by asking a question about your study materials"
              actionLabel="Ask a Question"
              actionPage="AskQuestion"
            />
          )
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedQuestions).map(([date, dateQuestions]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                <div className="space-y-4">
                  {dateQuestions.map((question) => (
                    <div key={question.id} className="relative group">
                      <AnswerCard
                        question={question.question_text}
                        answer={question.ai_answer}
                        context={question.context_used}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(question.id)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}