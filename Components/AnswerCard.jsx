import React from 'react';
import { Bot, User, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';

export default function AnswerCard({ question, answer, context, isLatest }) {
  const [showContext, setShowContext] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-2xl overflow-hidden
        ${isLatest ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-indigo-100' : 'bg-white border border-gray-100'}
        shadow-sm
      `}
    >
      {/* Question */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-100 rounded-xl shrink-0">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <p className="text-gray-900 font-medium pt-1">{question}</p>
        </div>
      </div>

      {/* Answer */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 pt-1">
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Context Toggle */}
        {context && (
          <div className="mt-4 ml-11">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowContext(!showContext)}
              className="text-gray-500 hover:text-gray-700 -ml-2"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {showContext ? 'Hide' : 'Show'} source context
              {showContext ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </Button>

            <AnimatePresence>
              {showContext && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {context}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}