import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { getAllQuestionsAtoZ } from './firestore-utils/firestore-question-storage';

function EveryQuestion({ db }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  
  const cursorsRef = useRef([null]);
  const currentPageRef = useRef(0);
  
  const page = parseInt(searchParams.get('page') || '0', 10);
  const cursor = searchParams.get('cursor');

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        let cursorDoc = null;
        if (cursor) {
          cursorDoc = JSON.parse(atob(cursor));
        }
        const { questions: data, lastDoc } = await getAllQuestionsAtoZ(db, cursorDoc, 50);
        setQuestions(data);
        setHasMore(!!lastDoc);
        currentPageRef.current = page;
        
        if (lastDoc && page >= cursorsRef.current.length - 1) {
          const nextCursor = btoa(JSON.stringify({ path: lastDoc.ref.path, id: lastDoc.id }));
          cursorsRef.current = [...cursorsRef.current.slice(0, page + 1), nextCursor];
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [cursor, page]);

  const handlePrev = () => {
    if (page > 0) {
      const prevCursor = cursorsRef.current[page - 1];
      if (prevCursor) {
        setSearchParams({ cursor: prevCursor, page: String(page - 1) });
      } else {
        setSearchParams({});
      }
    }
  };

  const handleNext = () => {
    if (hasMore) {
      const nextCursor = cursorsRef.current[page + 1];
      if (nextCursor) {
        setSearchParams({ cursor: nextCursor, page: String(page + 1) });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/all-questions"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Browse
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Every Question</h1>
        <p className="text-gray-600 mb-8">All questions sorted alphabetically A-Z</p>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No questions found</div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
              {questions.map((q) => (
                <div key={q.id} className="p-4 hover:bg-gray-50">
                  <Link
                    to={`/question?id=${q.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {q.title}
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={page === 0}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              <span className="text-sm text-gray-600">
                Page {page + 1}
              </span>

              <button
                onClick={handleNext}
                disabled={!hasMore}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EveryQuestion;
