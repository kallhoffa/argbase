import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { addAnswerToQuestion } from './firestore-utils/firestore-question-storage';
import NavigationBar from './navigation-bar';

const ComposeAnswer = ({ db }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const questionId = searchParams.get('id');
  
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Create a wrapped version of navigate that checks for unsaved changes
  const guardedNavigate = useCallback((to) => {
    if (!hasUnsavedChanges || window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      navigate(to);
    }
  }, [hasUnsavedChanges, navigate]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      if (hasUnsavedChanges) {
        if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
          event.preventDefault();
          window.history.pushState(null, '', location.pathname + location.search);
        }
      }
    };

    // Push the current state so we can catch attempts to go back
    window.history.pushState(null, '', location.pathname + location.search);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, location]);

  // Handle browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Fetch question details
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const questionDoc = await getDoc(doc(db, 'questions', questionId));
        if (questionDoc.exists()) {
          setQuestion(questionDoc.data());
        } else {
          setError('Question not found');
        }
      } catch (err) {
        console.error('Error fetching question:', err);
        setError('Failed to load question');
      }
    };

    if (questionId) {
      fetchQuestion();
    }
  }, [db, questionId]);

  const handleContentChange = (e) => {
    setAnswerContent(e.target.value);
    setHasUnsavedChanges(true);
  };

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
      setHasUnsavedChanges(false);
      navigate(`/question?id=${questionId}`); // Safe to use regular navigate here
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar navigate={guardedNavigate} />
      
      <div className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          ) : null}

          {question && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Question</h2>
              <p className="text-gray-800">{question.title}</p>
            </div>
          )}
          
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
                  onChange={handleContentChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           placeholder-gray-400 resize-y"
                  placeholder="Write your answer here..."
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => guardedNavigate(`/question?id=${questionId}`)}
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
    </div>
  );
};

export default ComposeAnswer;