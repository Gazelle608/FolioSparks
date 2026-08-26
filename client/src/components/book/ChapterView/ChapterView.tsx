import React, { useState } from 'react';
import { Chapter } from '../../../types';
import { SparksWidget } from '../SparksWidget';

interface ChapterViewProps {
  chapter: Chapter;
  onSparksTip: (amount: number) => void;
  userBalance: number;
}

export const ChapterView: React.FC<ChapterViewProps> = ({ 
  chapter, 
  onSparksTip, 
  userBalance 
}) => {
  const [showSparksWidget, setShowSparksWidget] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-primary-900">
          Chapter {chapter.chapter_number}: {chapter.title}
        </h2>
        <button
          onClick={() => setShowSparksWidget(!showSparksWidget)}
          className="flex items-center gap-2 px-4 py-2 bg-spark-gradient text-primary-900 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
        >
          ✨ Send Sparks
        </button>
      </div>

      {showSparksWidget && (
        <div className="mb-6">
          <SparksWidget
            chapterId={chapter.id}
            authorName="Author" // This should be passed from parent
            onSendSparks={onSparksTip}
            userBalance={userBalance}
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
          {chapter.content || 'Chapter content goes here...'}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-400">
        <span>{chapter.word_count || 0} words</span>
        <span>Published {new Date(chapter.published_at || '').toLocaleDateString()}</span>
      </div>
    </div>
  );
};