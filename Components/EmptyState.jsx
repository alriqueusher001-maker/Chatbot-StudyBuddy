import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionPage,
  onAction 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-6">
        <Icon className="w-8 h-8 text-indigo-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-sm mb-6">{description}</p>
      
      {actionLabel && (actionPage || onAction) && (
        actionPage ? (
          <Link to={createPageUrl(actionPage)}>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-6">
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button 
            onClick={onAction}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-6"
          >
            {actionLabel}
          </Button>
        )
      )}
    </motion.div>
  );
}