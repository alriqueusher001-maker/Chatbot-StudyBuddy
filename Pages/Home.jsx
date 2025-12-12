import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Upload, 
  MessageSquare, 
  History, 
  BookOpen, 
  Sparkles,
  FileText,
  Brain,
  Zap,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 5),
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['questions'],
    queryFn: () => base44.entities.Question.list('-created_date', 5),
  });

  const features = [
    {
      icon: Upload,
      title: 'Upload Notes',
      description: 'Upload PDFs, images, or documents and let AI extract the content',
      page: 'UploadNotes',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: MessageSquare,
      title: 'Ask Questions',
      description: 'Get instant AI-powered answers based on your uploaded materials',
      page: 'AskQuestion',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: History,
      title: 'View History',
      description: 'Browse your previous questions and answers anytime',
      page: 'History',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const stats = [
    { label: 'Documents', value: documents.length, icon: FileText },
    { label: 'Questions Asked', value: questions.length, icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/40 to-purple-100/40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Learning Assistant
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                AI Study Buddy
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Upload your notes, ask questions, and get instant AI-powered answers. 
              Your personal study companion that understands your materials.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to={createPageUrl('UploadNotes')}>
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-8 h-12 shadow-lg shadow-indigo-200">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Notes
                </Button>
              </Link>
              <Link to={createPageUrl('AskQuestion')}>
                <Button size="lg" variant="outline" className="rounded-xl px-8 h-12 border-2">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Ask a Question
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          {(documents.length > 0 || questions.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-8 mt-16"
            >
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <stat.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-24 -mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Link to={createPageUrl(feature.page)}>
                <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 h-full">
                  <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 bg-gradient-to-r ${feature.color} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                    <feature.icon className={`w-6 h-6 text-indigo-600`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:gap-2 transition-all duration-300">
                    Get Started <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600">Three simple steps to supercharge your learning</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload', desc: 'Upload your study materials - PDFs, images, or documents', icon: Upload },
              { step: '02', title: 'Process', desc: 'AI extracts and understands your content automatically', icon: Brain },
              { step: '03', title: 'Learn', desc: 'Ask questions and get accurate answers instantly', icon: GraduationCap },
            ].map((item, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
                )}
                <div className="relative bg-white rounded-2xl p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}