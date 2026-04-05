# MongoDB Cleanup Commands

## Overview
After the migration from mock-based to on-chain architecture, these MongoDB collections are no longer needed:

- `invxrewards` - INVX token rewards (system removed)
- `investments` - Investment data (now tracked on-chain via BusinessToken contracts)
- `proposals` - Proposal data (now tracked on-chain via Governance contract)
- `votes` - Vote data (now tracked on-chain via Governance contract)

## Instructions

### Option 1: Using MongoDB Shell

```bash
# Connect to your MongoDB instance
mongosh "your-connection-string"

# Switch to the investx database
use investx

# Drop the collections
db.invxrewards.drop()
db.investments.drop()
db.proposals.drop()
db.votes.drop()

# Verify collections are dropped
db.getCollectionNames()
```

### Option 2: Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database
3. Navigate to the `investx` database
4. For each collection (`invxrewards`, `investments`, `proposals`, `votes`):
   - Click on the collection
   - Click the trash icon (Delete Collection)
   - Confirm the deletion

### Option 3: Using Node.js Script

Create a file `backend/scripts/cleanupMongoDB.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const collections = ['invxrewards', 'investments', 'proposals', 'votes'];
    
    for (const collectionName of collections) {
      try {
        await mongoose.connection.db.dropCollection(collectionName);
        console.log(`✅ Dropped collection: ${collectionName}`);
      } catch (err) {
        if (err.codeName === 'NamespaceNotFound') {
          console.log(`⚠️  Collection not found: ${collectionName}`);
        } else {
          throw err;
        }
      }
    }
    
    console.log('\n✅ Cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
```

Then run:
```bash
cd backend
node scripts/cleanupMongoDB.js
```

## What Stays

These collections are still in use:

- `users` - User accounts and profiles
- `businesses` - Business metadata (token contract addresses stored here)
- `dividendrecords` - Dividend distribution history
- `notifications` - User notifications

## Verification

After cleanup, verify the remaining collections:

```bash
# MongoDB Shell
use investx
db.getCollectionNames()
```

Expected output:
```
[
  'businesses',
  'dividendrecords',
  'notifications',
  'users'
]
```

## Backup Recommendation

Before dropping collections, consider creating a backup:

```bash
# Backup specific collections
mongodump --uri="your-connection-string" --db=investx --collection=invxrewards --out=./backup
mongodump --uri="your-connection-string" --db=investx --collection=investments --out=./backup
mongodump --uri="your-connection-string" --db=investx --collection=proposals --out=./backup
mongodump --uri="your-connection-string" --db=investx --collection=votes --out=./backup
```

## Done!

After cleanup, your MongoDB database will only contain the essential collections needed for the on-chain architecture.
