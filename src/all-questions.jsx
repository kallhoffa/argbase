import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, ChevronRight, List } from 'lucide-react';
import { getPopularQuestions, getRecentQuestions } from './firestore-utils/firestore-question-storage';

const QuestionList = ({ questions, icon: Icon, iconColor, title }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Icon className={`w-5 h-5 mr-2 ${iconColor}`} />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {questions.length === 0 ? (
        <p className="text-gray-500 text-sm">No questions yet</p>
      ) : (
        <ul className="space-y-3">
          {questions.map((q) => (
            <li key={q.id}>
              <Link
                to={`/question?id=${q.id}`}
                className="block text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium truncate"
              >
                {q.title}
              </Link>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <span className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {q.viewCount || 0} views
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {q.createdAt?.toDate ? q.createdAt.toDate().toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

function AllQuestions({ db }) {
  const [popular, setPopular] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const [popularData, recentData] = await Promise.all([
          getPopularQuestions(db),
          getRecentQuestions(db)
        ]);
        setPopular(popularData);
        setRecent(recentData);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [db]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Questions</h1>
        <p className="text-gray-600 mb-8">See what others are asking on ArgBase</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <QuestionList
            questions={popular}
            icon={Eye}
            iconColor="text-blue-500"
            title="Popular Questions"
          />
          <QuestionList
            questions={recent}
            icon={Clock}
            iconColor="text-green-500"
            title="Recent Questions"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <List className="w-5 h-5 mr-2 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900">Every Question Asked</h2>
            </div>
            <Link
              to="/all-questions/every"
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            Browse through every question in our database, sorted alphabetically
          </p>
        </div>
      </div>
    </div>
  );
}

export default AllQuestions;
