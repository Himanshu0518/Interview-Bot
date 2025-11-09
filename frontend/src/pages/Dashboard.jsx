import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardServices from '../services/dashboard';
import {toast} from 'react-toastify';
import { 
  Download, 
  TrendingUp, 
  Calendar, 
  Award, 
  FileText, 
  BarChart3,
  Clock,
  Target,
  Loader2,
  ChevronDown,
  ChevronUp,
  Star,
  Eye,
  ArrowLeft
} from 'lucide-react';


function Dashboard() {
  const [stats, setStats] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});
 // const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // NO AUTH - just fetch public data
      const [statsData, historyData] = await Promise.all([
        DashboardServices.getDashboardStats(),
        DashboardServices.getTestHistory(10) // Get last 10 tests
      ]);

      setStats(statsData);
      setTestHistory(historyData.tests || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTest = async (testId) => {
    try {
      setLoading(true);
      const testDetail = await DashboardServices.getTestDetail(testId);
      setSelectedTest(testDetail);
      setExpandedQuestions({});
    } catch (err) {
      console.error('Error fetching test detail:', err);
      toast.error('Failed to load test details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedTest(null);
    setExpandedQuestions({});
  };

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleDownloadReport = async (testId) => {
    try {
      setDownloading(testId);
      await DashboardServices.downloadReport(testId);
    } catch (err) {
      console.error('Error downloading report:', err);
      toast.error('Failed to download report. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const getRatingStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !selectedTest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // DETAILED TEST VIEW
  if (selectedTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBackToList}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          {/* Test Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedTest.interview_type} Interview
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedTest.created_at)}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                    {selectedTest.difficulty_level}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDownloadReport(selectedTest._id)}
                disabled={downloading === selectedTest._id}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
              >
                {downloading === selectedTest._id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Questions Answered</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedTest.questions_answered}/{selectedTest.total_questions}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedTest.average_rating?.toFixed(2)}/5.0
                  </p>
                  {getRatingStars(Math.round(selectedTest.average_rating))}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Performance</p>
                <p className={`text-xl font-bold ${getRatingColor(selectedTest.average_rating)}`}>
                  {selectedTest.average_rating >= 4 ? 'Excellent' : selectedTest.average_rating >= 3 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Questions & Feedback
            </h2>

            {selectedTest.questions_data?.map((question, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        Question {index + 1}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(question.rating)}`}>
                        {question.rating?.toFixed(1)}/5.0
                      </span>
                      {getRatingStars(Math.round(question.rating))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {question.question}
                    </p>
                  </div>
                  {expandedQuestions[index] ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                  )}
                </button>

                {/* Question Details */}
                {expandedQuestions[index] && (
                  <div className="p-6 pt-0 space-y-6 border-t border-gray-200 dark:border-gray-700">
                    {/* Your Answer */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Your Answer
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {question.user_answer || 'No answer provided'}
                        </p>
                      </div>
                    </div>

                    {/* Expected Answer */}
                    {question.expected_answer && (
                      <div>
                        <h4 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Expected Answer
                        </h4>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {question.expected_answer}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    {question.feedback && (
                      <div>
                        <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          AI Feedback
                        </h4>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {question.feedback}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Improved Answer */}
                    {question.better_answer && (
                      <div>
                        <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                          <Star className="w-5 h-5" />
                          Suggested Improved Answer
                        </h4>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {question.better_answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD LIST VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Performance Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your interview performance and view detailed feedback
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tests */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Total Tests
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.total_tests || 0}
            </p>
          </div>

          {/* Questions Answered */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Target className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Questions Answered
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.total_questions_answered || 0}
            </p>
          </div>

          {/* Average Rating */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Average Rating
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.overall_average_rating?.toFixed(2) || '0.00'}/5.0
            </p>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Last Activity
            </h3>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {stats?.recent_test_date ? formatDate(stats.recent_test_date) : 'No tests yet'}
            </p>
          </div>
        </div>

        {/* Test History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Recent Test History
            </h2>
            <button
              onClick={fetchDashboardData}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
            >
              Refresh
            </button>
          </div>

          {testHistory.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No test history yet. Take your first interview!
              </p>
              <button
                onClick={() => navigate('/test_setup')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Start Interview
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {testHistory.map((test) => (
                <div
                  key={test._id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {test.interview_type} Interview
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                          {test.difficulty_level}
                        </span>
                        <span className={`px-3 py-1 ${getRatingColor(test.average_rating)} text-xs font-medium rounded-full`}>
                          {test.average_rating?.toFixed(2)}/5.0
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(test.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {test.questions_answered}/{test.total_questions} questions
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewTest(test._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleDownloadReport(test._id)}
                        disabled={downloading === test._id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                      >
                        {downloading === test._id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Download PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best Performance */}
        {stats?.best_performance && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-2xl shadow-lg p-6 border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                <Award className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Best Performance
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-1">
                  Highest Average Rating
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.best_performance.rating?.toFixed(2)}/5.0
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(stats.best_performance.date)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
