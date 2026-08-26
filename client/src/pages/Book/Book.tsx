import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { useSparks } from '../../hooks/useSparks';
import { Book as BookType, Author, Chapter, Poll } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DonationWidget } from '../../components/book/DonationWidget';
import { SparksWidget } from '../../components/book/SparksWidget';
import { PollWidget } from '../../components/book/PollWidget';
import { ChapterView } from '../../components/book/ChapterView';

export const Book: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, refreshBalance } = useSparks();
  
  const [book, setBook] = useState<BookType | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    if (bookId) {
      fetchBookData(bookId);
    }
  }, [bookId]);

  const fetchBookData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch book
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();

      if (bookError) throw bookError;
      setBook(bookData);

      // Fetch author
      const { data: authorData, error: authorError } = await supabase
        .from('authors')
        .select('*')
        .eq('id', bookData.author_id)
        .single();

      if (authorError) throw authorError;
      setAuthor(authorData);

      // Fetch chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', id)
        .eq('is_published', true)
        .order('chapter_number', { ascending: true });

      if (chaptersError) throw chaptersError;
      setChapters(chaptersData || []);

      // Fetch polls
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .eq('book_id', id)
        .eq('is_active', true);

      if (pollsError) throw pollsError;
      setPolls(pollsData || []);

      // Increment read count
      await supabase
        .from('books')
        .update({ total_reads: (bookData.total_reads || 0) + 1 })
        .eq('id', id);

    } catch (error) {
      console.error('Error fetching book data:', error);
      setError('Failed to load the story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSparksTip = async (chapterId: string, amount: number) => {
    if (!user) {
      alert('Please sign in to send Sparks');
      navigate('/signin');
      return;
    }

    if (amount > balance) {
      alert(`Insufficient Sparks balance. You have ${balance} Sparks.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('sparks_transactions')
        .insert([{
          from_user_id: user.id,
          to_author_id: author?.id,
          chapter_id: chapterId,
          amount: amount,
          type: 'tip',
          note: '',
        }]);

      if (error) throw error;
      
      // Update book's total sparks
      await supabase
        .from('books')
        .update({ total_sparks: (book?.total_sparks || 0) + amount })
        .eq('id', bookId);

      // Refresh balance
      await refreshBalance();
      
      alert(`✨ Sent ${amount} Sparks to ${author?.display_name}!`);
    } catch (error) {
      console.error('Error sending Sparks:', error);
      alert('Failed to send Sparks. Please try again.');
    }
  };

  const handlePollVote = async (pollId: string, optionId: string) => {
    if (!user) {
      alert('Please sign in to vote');
      navigate('/signin');
      return;
    }

    try {
      const { error } = await supabase
        .from('poll_votes')
        .insert([{
          poll_id: pollId,
          user_id: user.id,
          option_id: optionId,
        }]);

      if (error) throw error;
      
      alert('✅ Vote recorded! Check back to see the results.');
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to record vote. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !book || !author) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Book not found'}</p>
        <button 
          onClick={() => navigate('/library')}
          className="mt-4 btn-primary"
        >
          Back to Library
        </button>
      </div>
    );
  }

  const currentChapter = chapters[currentChapterIndex] || null;
  const hasChapters = chapters.length > 0;

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Book Header */}
      <div className="bg-gradient-green text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Cover */}
            <div className="w-48 h-64 rounded-xl shadow-2xl overflow-hidden flex-shrink-0 bg-primary-700 flex items-center justify-center text-6xl">
              {book.cover_url ? (
                <img 
                  src={book.cover_url} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                '📖'
              )}
            </div>

            {/* Book Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-serif mb-2">{book.title}</h1>
              <p className="text-primary-200 mb-4">by {author.display_name}</p>
              <p className="text-primary-100 mb-6">{book.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {book.tags?.map((tag: string) => (
                  <span key={tag} className="text-xs bg-primary-700/50 text-primary-200 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-primary-200">
                <span>{book.total_reads || 0} reads</span>
                <span>⭐ {book.total_sparks || 0} Sparks</span>
                <span>{chapters.length} chapters</span>
                {book.status === 'complete' && (
                  <span className="bg-primary-600/50 px-3 py-1 rounded-full">Complete</span>
                )}
              </div>

              <div className="mt-4">
                <DonationWidget 
                  authorName={author.display_name}
                  platforms={author.donation_platforms}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Area */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {!isReading ? (
          // Book Overview
          <div className="space-y-8">
            {/* Chapter List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-serif text-primary-900 mb-4">Table of Contents</h3>
              {hasChapters ? (
                <div className="space-y-2">
                  {chapters.map((chapter, index) => (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        setCurrentChapterIndex(index);
                        setIsReading(true);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-50 transition-all duration-200 flex items-center justify-between group"
                    >
                      <span className="text-primary-900">
                        Chapter {chapter.chapter_number}: {chapter.title}
                      </span>
                      <span className="text-sm text-gray-400 group-hover:text-primary-600">
                        {chapter.word_count || 0} words →
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No chapters published yet. Check back soon!</p>
              )}
            </div>

            {/* Polls Section */}
            {polls.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-serif text-primary-900">📊 Chapter Polls</h3>
                {polls.map((poll) => (
                  <PollWidget 
                    key={poll.id}
                    poll={poll}
                    onVote={(optionId) => handlePollVote(poll.id, optionId)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Reading View
          <div>
            <button
              onClick={() => setIsReading(false)}
              className="mb-6 text-primary-600 hover:text-primary-700 flex items-center gap-2"
            >
              ← Back to overview
            </button>

            {currentChapter && (
              <div className="space-y-8">
                <ChapterView 
                  chapter={currentChapter}
                  onSparksTip={(amount) => handleSparksTip(currentChapter.id, amount)}
                  userBalance={balance}
                />

                {/* Chapter Navigation */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentChapterIndex === 0}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Chapter {currentChapter.chapter_number} of {chapters.length}
                  </span>
                  <button
                    onClick={() => setCurrentChapterIndex(prev => Math.min(chapters.length - 1, prev + 1))}
                    disabled={currentChapterIndex === chapters.length - 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};