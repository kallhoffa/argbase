// migrations/001_create_arguments_collection.js

const admin = require('firebase-admin');

exports.up = async function up() {
  const db = admin.firestore();

  // Create the arguments collection (no specific schema enforcement in Firestore)
  // You can add schema validation rules in Firebase Security Rules
  console.log('Creating arguments collection');
};

exports.down = async function down() {
  const db = admin.firestore();

  // Delete the arguments collection
  console.log('Deleting arguments collection');
  const collectionRef = db.collection('arguments');
  const query = collectionRef.orderBy('__name__').limit(500);

  return new Promise((resolve, reject) => {
    deleteCollection(db, 'arguments', 500, resolve, reject);
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
