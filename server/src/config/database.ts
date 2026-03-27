import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management';
    await mongoose.connect(mongoURI);

    // Reconcile legacy fee.transactionId index to prevent duplicate key on null values.
    try {
      const feesCollection = mongoose.connection.collection('fees');
      const indexes = await feesCollection.indexes();
      const hasLegacyTxIndex = indexes.some((idx) => idx.name === 'transactionId_1');

      if (hasLegacyTxIndex) {
        await feesCollection.dropIndex('transactionId_1');
      }

      await feesCollection.createIndex(
        { transactionId: 1 },
        {
          name: 'transactionId_1',
          unique: true,
          sparse: true,
        }
      );
    } catch (indexError) {
      console.error('Fee transactionId index reconciliation warning:', indexError);
    }

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
