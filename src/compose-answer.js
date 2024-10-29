import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addAnswerToQuestion } from './firestore-utils/firestore-question-storage';

const ComposeAnswer = ({ db }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const questionId = searchParams.get('id');
  
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!answerContent.trim()) {
      setError('Answer content cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const newAnswer = {
        content: answerContent.trim(),
        upvotes: 0,
        downvotes: 0,
        author: 'Anonymous', // Replace with actual user info when auth is implemented
        comments: []
      };

      await addAnswerToQuestion(db, questionId, newAnswer);
      
      // Navigate back to the question page
      navigate(`/question?id=${questionId}`);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Compose Your Answer
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="answer-content" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Answer
              </label>
              <textarea
                id="answer-content"
                rows="12"
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         placeholder-gray-400 resize-y"
                placeholder="Write your answer here..."
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(`/question?id=${questionId}`)}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-full text-white font-medium
                         ${isSubmitting 
                           ? 'bg-blue-400 cursor-not-allowed' 
                           : 'bg-blue-600 hover:bg-blue-700'
                         }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComposeAnswer;
