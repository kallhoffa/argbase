import { collection, addDoc, Timestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';

/**
 * Interface for a comment on an answer
 * @typedef {Object} Comment
 * @property {string} content - The comment text
 * @property {string} author - Username of comment author
 * @property {number} upvotes - Number of upvotes on the comment
 */

/**
 * Interface for an answer to a question
 * @typedef {Object} Answer
 * @property {string} content - The answer text
 * @property {number} upvotes - Number of upvotes
 * @property {number} downvotes - Number of downvotes
 * @property {string} author - Username of answer author
 * @property {Comment[]} comments - Array of comments on this answer
 */

/**
 * Interface for a question
 * @typedef {Object} Question
 * @property {string} title - The question text
 * @property {Answer[]} answers - Array of answers
 * @property {string[]} relatedQuestions - Array of related question titles
 */

/**
 * Stores a new question with its answers in Firestore
 * @param {import('firebase/firestore').Firestore} db - Firestore database instance
 * @param {Question} questionData - The question data to store
 * @returns {Promise<string>} The ID of the newly created question document
 */
export const storeQuestion = async (db, questionData) => {
  try {
    const questionsCollection = collection(db, 'questions');
    
    // Format the question data with timestamps and initial metadata
    const formattedQuestion = {
      title: questionData.title,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      viewCount: 0,
      status: 'active',
      answers: questionData.answers.map(answer => ({
        ...answer,
        createdAt: Timestamp.now(),
        lastModified: Timestamp.now(),
        isAccepted: false,
        comments: answer.comments.map(comment => ({
          ...comment,
          createdAt: Timestamp.now(),
          isEdited: false
        }))
      })),
      relatedQuestions: questionData.relatedQuestions || []
    };

    // Add the question to Firestore
    const docRef = await addDoc(questionsCollection, formattedQuestion);
    return docRef.id;
  } catch (error) {
    console.error('Error storing question:', error);
    throw error;
  }
};

/**
 * Updates an existing question's answers in Firestore
 * @param {import('firebase/firestore').Firestore} db - Firestore database instance
 * @param {string} questionId - The ID of the question to update
 * @param {Answer} newAnswer - The new answer to add
 * @returns {Promise<void>}
 */
export const addAnswerToQuestion = async (db, questionId, newAnswer) => {
  try {
    const questionRef = doc(db, 'questions', questionId);
    
    const formattedAnswer = {
      ...newAnswer,
      createdAt: Timestamp.now(),
      lastModified: Timestamp.now(),
      isAccepted: false,
      comments: newAnswer.comments?.map(comment => ({
        ...comment,
        createdAt: Timestamp.now(),
        isEdited: false
      })) || []
    };

    await updateDoc(questionRef, {
      answers: arrayUnion(formattedAnswer),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding answer:', error);
    throw error;
  }
};

// Example usage:
const exampleQuestion = {
  title: "What is gravity?",
  answers: [
    {
      content: "Gravity is a fundamental force of nature...",
      upvotes: 1427,
      downvotes: 124,
      author: "PhysicsProf",
      comments: [
        {
          content: "Great explanation!",
          author: "QuantumLearner",
          upvotes: 89
        }
      ]
    }
  ],
  relatedQuestions: [
    "How does gravity affect time?",
    "What is the gravitational constant?"
  ]
};
