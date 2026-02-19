// migrations/005_populate_arguments_collection.js

const admin = require('firebase-admin');

exports.up = async function up() {
  const db = admin.firestore();

  // Populate the arguments collection with 50 test arguments
  console.log('Populating arguments collection');

  const batch = db.batch();
  for (let i = 1; i <= 50; i++) {
    const argumentRef = db.collection('arguments').doc(); // Auto-generated ID
    batch.set(argumentRef, {
      statement: `Argument ${i}: This is a test argument about something.`,  
      description: `Description of argument ${i}`
    });
  }

  await batch.commit();
  console.log('Populated arguments collection with 50 arguments');
};

exports.down = async function down() {
  const db = admin.firestore();

  // Delete the 50 test arguments from the arguments collection
  console.log('Deleting 50 test arguments from arguments collection');
  const collectionRef = db.collection('arguments');
  const query = collectionRef.limit(50); // Delete only the test arguments

  return new Promise((resolve, reject) => {
    deleteCollection(db, 'arguments', 50, resolve, reject);
  });

  async function deleteCollection(db, collectionPath, batchSize, resolve, reject) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, batchSize, resolve, reject);
    });
  }

  async function deleteQueryBatch(db, query, batchSize, resolve, reject) {
    query.get()
      .then((snapshot) => {
        // When there are no documents left, we are done
        if (snapshot.size === 0) {
          return 0;
        }

        // Delete documents in a batch
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        return batch.commit().then(() => {
          return snapshot.size;
        });
      }).then((numDeleted) => {
        if (numDeleted === 0) {
          resolve();
          return;
        }

        // Recurse on the next process tick, to avoid exploding the stack.
        process.nextTick(() => {
          deleteQueryBatch(db, query, batchSize, resolve, reject);
        });
      })
      .catch(reject);
  }
};
