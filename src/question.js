import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, ExternalLink, ChevronRight, Search } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { storeQuestion } from './firestore-utils/firestore-question-storage'; // Import the function we created earlier


// Mock data
// const mockQuestion = {
//   /* Previous mock data structure... */
//   id: 1,
//   title: "What is gravity?",
//   answers: [
//     {
//       id: 1,
//       content: "Gravity is a fundamental force of nature that attracts any two masses in the universe. It's described mathematically by Einstein's theory of general relativity, which shows that massive objects curve spacetime itself. This curvature is what we experience as the force of gravity. On Earth, gravity accelerates objects at approximately 9.8 meters per second squared.",
//       upvotes: 1427,
//       downvotes: 124,
//       author: "PhysicsProf",
//       timestamp: "2024-02-15",
//       comments: [
//         { id: 1, content: "Great explanation! Could you elaborate on how this relates to quantum gravity?", author: "QuantumLearner", upvotes: 89 },
//         { id: 2, content: "The spacetime curvature explanation really helped me visualize it.", author: "ScienceStudent", upvotes: 45 }
//       ]
//     },
//     {
//       id: 2,
//       content: "Gravity can be simply understood as the force that pulls objects toward each other. The strength of this pull depends on two things: the masses of the objects and the distance between them. This is described by Newton's law of universal gravitation.",
//       upvotes: 892,
//       downvotes: 76,
//       author: "ScienceTeacher",
//       timestamp: "2024-02-14",
//       comments: [
//         { id: 3, content: "This simplified version is great for beginners!", author: "NewLearner", upvotes: 34 }
//       ]
//     }
//   ],
//   relatedQuestions: [
//     "How does gravity affect time?",
//     "What is the gravitational constant?",
//     "Can gravity be shielded?",
//     "How do black holes relate to gravity?",
//     "Why do objects fall at the same speed in a vacuum?"
//   ]
// };

// Navigation Bar Component
const NavigationBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to answer page with search query as parameter
      navigate(`/question?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-900">
              Arg<span className="text-blue-600">Base</span>
            </h1>
          </a>

          {/* Search Bar */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What would you like to know?"
                className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-full 
                         focus:outline-none focus:border-blue-400 
                         placeholder-gray-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5
                         text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Right side menu/buttons if needed */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-600 text-sm font-medium">
              Log In
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// No Question Module
const NoQuestionFound = ({ searchQuery, onAskQuestion }) => {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        No matches found for "{searchQuery}"
      </h2>
      <p className="text-gray-600 mb-8">
        Be the first to ask this question on ArgBase!
      </p>
      <button
        onClick={onAskQuestion}
        className="bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-medium 
                 hover:bg-blue-700 transition-colors inline-flex items-center"
      >
        Ask ArgBase
      </button>
    </div>
  );
};

// Answer Card Component remains the same
const AnswerCard = ({ answer, isTopAnswer }) => {
  const [showAllComments, setShowAllComments] = useState(false);
  const displayComments = showAllComments ? answer.comments : answer.comments.slice(0, 2);

  return (
    <div className={`p-6 mb-4 rounded-lg border ${isTopAnswer ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
      {isTopAnswer && (
        <div className="mb-3 text-blue-600 font-semibold flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Top Answer
        </div>
      )}
      
      <div className="text-gray-800 text-lg">{answer.content}</div>
      
      <div className="mt-4 flex items-center text-sm text-gray-600">
        <span className="font-medium mr-2">{answer.author}</span>
        <span>{answer.createdAt?.toDate().toLocaleDateString()}</span>
      </div>
      
      <div className="mt-4 flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
            <ThumbsUp size={18} />
            <span>{answer.upvotes}</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600">
            <ThumbsDown size={18} />
            <span>{answer.downvotes}</span>
          </button>
        </div>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
          <ExternalLink size={18} />
          <span>Expand</span>
        </button>
      </div>

      {answer.comments && answer.comments.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center text-gray-600">
            <MessageCircle size={18} className="mr-2" />
            <span className="font-medium">Comments</span>
          </div>
          {displayComments.map(comment => (
            <div key={comment.id} className="ml-6 p-3 bg-gray-50 rounded-lg">
              <div className="text-gray-800">{comment.content}</div>
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <span className="font-medium mr-2">{comment.author}</span>
                <ThumbsUp size={14} className="mr-1" />
                <span>{comment.upvotes}</span>
              </div>
            </div>
          ))}
          {answer.comments.length > 2 && (
            <button 
              onClick={() => setShowAllComments(!showAllComments)}
              className="ml-6 text-blue-600 hover:text-blue-800 text-sm"
            >
              {showAllComments ? 'Show less' : `Show ${answer.comments.length - 2} more comments`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Main Question Page Component
const QuestionPage = ({ db }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const questionId = searchParams.get('id');
  const searchQuery = searchParams.get('q');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionData, setQuestionData] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        setError(null);

        let questionDoc;
        if (questionId) {
          // Fetch by ID if available
          const docRef = doc(db, 'questions', questionId);
          questionDoc = await getDoc(docRef);
        } else if (searchQuery) {
          // Search by title if no ID
          const q = query(
            collection(db, 'questions'),
            where('title', '==', searchQuery)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            questionDoc = querySnapshot.docs[0];
          }
        }

        if (questionDoc?.exists()) {
          setQuestionData({
            id: questionDoc.id,
            ...questionDoc.data()
          });
        } else {
          setQuestionData(null);
        }
      } catch (err) {
        console.error('Error fetching question:', err);
        setError('Failed to load question data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [db, questionId, searchQuery]);

  const handleAskQuestion = async () => {
    try {
      // Create a new question template
      const newQuestion = {
        title: searchQuery,
        answers: [],
        relatedQuestions: [],
        // Add any additional default fields you want
      };

      const newQuestionId = await storeQuestion(db, newQuestion);
      // Navigate to the new question page
      navigate(`/answer?id=${newQuestionId}`);
    } catch (err) {
      console.error('Error creating question:', err);
      setError('Failed to create question');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              {error}
            </div>
          ) : !questionData ? (
            <NoQuestionFound 
              searchQuery={searchQuery}
              onAskQuestion={handleAskQuestion}
            />
          ) : (
            <div className="flex gap-6">
              <div className="flex-grow max-w-4xl">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                  {questionData.title}
                </h1>
                
                <div className="space-y-6">
                  {questionData.answers.map((answer, index) => (
                    <AnswerCard 
                      key={answer.id || index}
                      answer={answer}
                      isTopAnswer={index === 0}
                    />
                  ))}
                </div>
              </div>

              {questionData.relatedQuestions?.length > 0 && (
                <div className="w-72 hidden lg:block">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Related Questions
                    </h2>
                    <nav className="space-y-3">
                      {questionData.relatedQuestions.map((question, index) => (
                        <a
                          key={index}
                          href={`/answer?q=${encodeURIComponent(question)}`}
                          className="flex items-center text-gray-600 hover:text-blue-600 group"
                        >
                          <ChevronRight 
                            size={16} 
                            className="mr-2 text-gray-400 group-hover:text-blue-600" 
                          />
                          <span>{question}</span>
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;