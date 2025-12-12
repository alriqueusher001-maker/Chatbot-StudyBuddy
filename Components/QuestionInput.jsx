import React, { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from 'framer-motion';

export default function QuestionInput({ onSubmit, isLoading, placeholder }) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
      setQuestion('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="relative bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ask anything about your notes..."}
          disabled={isLoading}
          className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-base p-5 pb-16"
        />
        
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by AI</span>
          </div>
          
          <Button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-5 h-10 shadow-md shadow-indigo-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Ask
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.form>
  );
}