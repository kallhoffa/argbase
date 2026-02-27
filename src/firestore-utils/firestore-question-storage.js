import { collection, addDoc, Timestamp, doc, updateDoc, arrayUnion, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';

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
 * @property {string} id - The document ID
 * @property {string} title - The question text
 * @property {Answer[]} answers - Array of answers
 * @property {string[]} relatedQuestions - Array of related question titles
 * @property {number} viewCount - Number of views
 * @property {import('firebase/firestore').Timestamp} createdAt - Creation timestamp
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

/**
 * Retrieves popular questions sorted by view count
 * @param {import('firebase/firestore').Firestore} db - Firestore database instance
 * @param {number} [limitCount=10] - Maximum number of questions to return
 * @returns {Promise<Question[]>} Array of popular questions
 */
export const getPopularQuestions = async (db, limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'questions'),
      orderBy('viewCount', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching popular questions:', error);
    throw error;
  }
};

/**
 * Retrieves recent questions sorted by creation date
 * @param {import('firebase/firestore').Firestore} db - Firestore database instance
 * @param {number} [limitCount=10] - Maximum number of questions to return
 * @returns {Promise<Question[]>} Array of recent questions
 */
export const getRecentQuestions = async (db, limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'questions'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching recent questions:', error);
    throw error;
  }
};

/**
 * Retrieves all questions sorted alphabetically A-Z with cursor-based pagination
 * @param {import('firebase/firestore').Firestore} db - Firestore database instance
 * @param {import('firebase/firestore').QueryDocumentSnapshot} [cursorDoc=null] - Cursor document to start after
 * @param {number} [pageSize=50] - Number of questions per page
 * @returns {Promise<{questions: Question[], lastDoc: import('firebase/firestore').QueryDocumentSnapshot|null}>}
 */
export const getAllQuestionsAtoZ = async (db, cursorDoc = null, pageSize = 50) => {
  try {
    const constraints = [orderBy('title', 'asc'), limit(pageSize)];
    if (cursorDoc) {
      constraints.push(startAfter(cursorDoc));
    }
    const q = query(collection(db, 'questions'), ...constraints);
    const snapshot = await getDocs(q);
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    return { questions, lastDoc };
  } catch (error) {
    console.error('Error fetching all questions:', error);
    throw error;
  }
};
